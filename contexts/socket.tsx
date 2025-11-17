"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
    undefined
);

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const session = useSession();
    const token = (session.data as any)?.accessToken;
    useEffect(() => {
        if (!token) return;
        const socketIO = io(process.env.NEXT_PUBLIC_API_URL!, {
            transports: ["websocket"],
            query: {
                token,
            },
        });
        setSocket(socketIO);
        return () => {
            socketIO.disconnect();
            setSocket(null);
        };
    }, [token]);
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
        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", (reason, details) => {
            console.log("🔌 Socket disconnected:", reason, details);
            
            // Handle forced disconnection
            if (reason === "io server disconnect") {
                // Server forcefully closed connection, try to reconnect
                console.log("Server disconnected socket, attempting to reconnect...");
            }
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('jwt expired') || 
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized')) {
                console.error("Authentication error: Session expired");
                
                // Disconnect socket to prevent reconnection attempts
                socket.disconnect();

                router.push('/login?expired=true');
            }
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
        };
    }, [socket, router]);
    return null;
}
