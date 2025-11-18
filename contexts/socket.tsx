"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
    undefined
);

// Global singleton socket - ensures only ONE socket instance for entire app
let globalSocket: Socket | null = null;

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const session = useSession();
    const token = session.data?.user?.accessToken;
    const previousToken = useRef<string | undefined>(undefined);

    console.log('[SocketProvider] RENDER - Session status:', session.status, 'Token:', !!token);

    useEffect(() => {
        console.log('[SocketProvider] Effect triggered - Session status:', session.status, 'Token:', token ? 'present' : 'missing');

        if (session.status === 'loading') {
            console.log('[SocketProvider] Session still loading, waiting...');
            return;
        }
        
        if (!token) {
            console.log('[SocketProvider] No token available');
            if (globalSocket) {
                console.log('[SocketProvider] Cleaning up existing socket due to no token');
                globalSocket.disconnect();
                globalSocket = null;
                setSocket(null);
            }
            return;
        }

        if (previousToken.current && previousToken.current !== token) {
            console.log('[SocketProvider] Token changed, disconnecting old socket');
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
            }
        }

        previousToken.current = token;

        if (globalSocket) {
            console.log('[SocketProvider] Reusing existing socket:', globalSocket.id, 'connected:', globalSocket.connected);
            setSocket(globalSocket);
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        console.log('[SocketProvider] Creating new socket connection to:', apiUrl);
        console.log('[SocketProvider] Token length:', token.length, 'First 20 chars:', token.substring(0, 20));
        
        const socketIO = io(apiUrl, {
            transports: ["websocket"],
            query: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: true,
        });

        socketIO.on('connect', () => {
            console.log('[SocketProvider] Socket connected successfully! ID:', socketIO.id);
        });

        socketIO.on('connect_error', (error) => {
            console.error('[SocketProvider] Connection error:', error.message);
            console.error('[SocketProvider] Error details:', error);
        });

        socketIO.on('disconnect', (reason) => {
            console.log('[SocketProvider] Socket disconnected. Reason:', reason);
        });

        socketIO.on('error', (error) => {
            console.error('[SocketProvider] Socket error:', error);
        });

        globalSocket = socketIO;
        setSocket(socketIO);
        console.log('[SocketProvider] Socket instance created, connecting...');
    }, [token, session.status]);

    const value: SocketContextType = {
        socket,
    };

    return (
        <SocketContext.Provider value={value}>
            {socket !== null && <SocketEvents socket={socket} />}
            {children}
        </SocketContext.Provider>
    );
}

export const disconnectSocket = () => {
    console.log('[SocketProvider] Manual disconnect called');
    if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
    }
};

export const useSocketContext = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
};

export function SocketEvents({ socket }: { socket: Socket }) {
    const router = useRouter();

    useEffect(() => {
        console.log('[SocketEvents] Setting up listeners for socket:', socket.id);

        const handleConnect = () => {
            console.log("[Socket] Connected:", socket.id);
            socket.emit('getOnlineUsers');
        };

        const handleDisconnect = (reason: string, details: any) => {
            console.log("[Socket] Disconnected:", reason, details);
            if (reason === "io server disconnect") {
                console.log("[Socket] Server disconnected, will auto-reconnect...");
            }
        };

        const handleConnectError = (error: Error) => {
            console.error("[Socket] Connection error:", error.message);
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('jwt expired') || 
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized')) {
                console.error("[Socket] Auth error: Session expired");
                disconnectSocket();
                router.push('/login?expired=true');
            }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            console.log('[SocketEvents] Socket already connected, requesting online users');
            socket.emit('getOnlineUsers');
        }

        return () => {
            console.log('[SocketEvents] Cleaning up listeners');
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, router]);

    return null;
}
