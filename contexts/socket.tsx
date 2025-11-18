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
let isConnecting = false; 

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const session = useSession();
    const token = session.data?.user?.accessToken;
    const previousToken = useRef<string | undefined>(undefined);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (session.status === 'loading') {
            return;
        }

        if (!token) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                isConnecting = false;
                setSocket(null);
            }
            return;
        }

        if (previousToken.current && previousToken.current !== token) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                isConnecting = false;
            }
        }

        previousToken.current = token;

        if (globalSocket && globalSocket.connected) {
            if (mountedRef.current) {
                setSocket(globalSocket);
            }
            return;
        }
        if (isConnecting) {
            return;
        }

        isConnecting = true;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const socketIO = io(apiUrl, {
            transports: ["websocket"],
            query: { token },
            reconnection: false,
            autoConnect: true,
        });

        socketIO.on('connect', () => {
            isConnecting = false;
            console.log('[Socket] Connected');
        });

        socketIO.on('connect_error', (error) => {
            isConnecting = false;
            console.error('[Socket] Connection error:', error.message);
        });

        socketIO.on('disconnect', (reason) => {
            isConnecting = false;
            console.log('[Socket] Disconnected:', reason);
        });

        socketIO.on('error', (error) => {
            console.error('[Socket] Error:', error);
        });

        globalSocket = socketIO;
        if (mountedRef.current) {
            setSocket(socketIO);
        }
        return () => {
            mountedRef.current = false;
        };
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
    if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        isConnecting = false;
    }
};


if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.addEventListener('beforeunload', () => {
        disconnectSocket();
    });
}

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
        const handleConnect = () => {
            socket.emit('getOnlineUsers');
        };

        const handleDisconnect = (reason: string) => {
            if (reason === "io server disconnect") {
                console.log("[Socket] Server disconnected:", reason);
            }
        };

        const handleConnectError = (error: Error) => {
            console.error("[Socket] Connection error:", error.message);
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
                disconnectSocket();
                router.push('/login?expired=true');
            }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            socket.emit('getOnlineUsers');
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, router]);

    return null;
}
