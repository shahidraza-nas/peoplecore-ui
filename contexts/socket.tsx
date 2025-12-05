"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import { Socket, io } from "socket.io-client";
import {
    requestNotificationPermission,
    onMessageListener,
    showNotification,
    getFcmTokenFromStorage,
    saveFcmTokenToStorage,
} from "@/lib/firebase";
import { toast } from "sonner";
import { API } from "@/lib/fetch";

interface SocketContextType {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
    undefined
);


let globalSocket: Socket | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
let hasInitialized = false;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const session = useSession();
    const token = session.data?.user?.accessToken;
    const previousToken = useRef<string | undefined>(undefined);
    const mountedRef = useRef(true);
    const effectRunCount = useRef(0);

    useEffect(() => {
        mountedRef.current = true;
        effectRunCount.current += 1;
        if (!token) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                isConnecting = false;
                hasInitialized = false;
                setSocket(null);
            }
            return;
        }
        if (previousToken.current && previousToken.current !== token) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                isConnecting = false;
                hasInitialized = false;
            }
        }
        previousToken.current = token;
        if (globalSocket && globalSocket.connected) {
            if (mountedRef.current && !socket) {
                setSocket(globalSocket);
            }
            return;
        }
        if (isConnecting) {
            return;
        }
        if (globalSocket && !globalSocket.connected) {
            if (mountedRef.current && !socket) {
                setSocket(globalSocket);
            }
            return;
        }
        if (hasInitialized && globalSocket) {
            if (mountedRef.current && !socket) {
                setSocket(globalSocket);
            }
            return;
        }
        isConnecting = true;
        hasInitialized = true;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const socketIO = io(apiUrl, {
            transports: ["websocket"],
            query: { token },
            reconnection: true, // DISABLE auto-reconnect to debug
            autoConnect: true,
            forceNew: false, // Don't create new connection if one exists
            multiplex: true, // Share single connection
        });
        socketIO.on('connect', () => {
            const wasReconnecting = reconnectAttempts > 0;
            isConnecting = false;
            reconnectAttempts = 0;
            if (wasReconnecting) {
                toast.success('Connected to chat server', { duration: 2000 });
            }
        });
        socketIO.on('connect_error', (error) => {
            isConnecting = false;
            reconnectAttempts++;
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
                toast.error('Session expired. Please login again.');
                return;
            }
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                toast.error('Unable to connect to chat server. Retrying...', { duration: 3000 });
            }
        });
        socketIO.on('disconnect', (reason) => {
            isConnecting = false;
        });
        socketIO.on('reconnect_attempt', () => { });
        socketIO.on('reconnect_failed', () => {
            toast.error('Chat connection unavailable. Please refresh the page.', {
                duration: 5000,
                icon: '🔌'
            });
        });
        socketIO.on('error', (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.error('[Socket] Error:', error);
            }
        });
        globalSocket = socketIO;
        if (mountedRef.current) {
            setSocket(socketIO);
        }
        return () => {
            mountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const value: SocketContextType = {
        socket,
    };

    return (
        <SocketContext.Provider value={value}>
            {socket && <SocketEvents socket={socket} />}
            {children}
        </SocketContext.Provider>
    );
}

export const disconnectSocket = () => {
    if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        isConnecting = false;
        hasInitialized = false;
        reconnectAttempts = 0;
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

export const SocketEvents = React.memo(function SocketEvents({ socket }: { socket: Socket }) {
    const router = useRouter();
    const fcmInitialized = useRef(false);
    const socketIdRef = useRef<string | undefined>(undefined);

    /**
     * Initialize Firebase Cloud Messaging
     */
    useEffect(() => {
        if (fcmInitialized.current) return;

        const initializeFCM = async () => {
            try {
                const existingToken = getFcmTokenFromStorage();
                if (!existingToken) {
                    const fcmToken = await requestNotificationPermission();

                    if (fcmToken) {
                        saveFcmTokenToStorage(fcmToken);
                        try {
                            await API.Post('auth/info', { fcm: fcmToken });
                        } catch (error) {
                            console.error('Failed to update FCM token on backend:', error);
                        }
                    }
                }
                const unsubscribe = onMessageListener((payload) => {
                    const title = payload?.notification?.title || payload?.data?.title || "New Message";
                    const body = payload?.notification?.body || payload?.data?.body || "You have a new message";
                    showNotification(title, {
                        body,
                        tag: payload?.data?.chatUid || 'chat-notification',
                        data: payload?.data,
                        requireInteraction: true,
                    });
                    toast.success(`${title}: ${body}`, {
                        duration: 5000,
                        position: "top-right",
                    });
                });
                fcmInitialized.current = true;
                return unsubscribe;
            } catch (error) {
                console.error("[FCM] Initialization error:", error);
            }
        };

        initializeFCM();
    }, []);

    useEffect(() => {
        if (!socket) return;
        if (socketIdRef.current !== socket.id) {
            socketIdRef.current = socket.id;
        }
        const handleConnect = () => {
            socket.emit('getOnlineUsers');
        };
        const handleDisconnect = () => { };
        const handleConnectError = (error: Error) => {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
                disconnectSocket();
                router.push('/login?expired=true');
            }
        };
        const handleNewMessage = (data: any) => {
            if (!window.location.pathname.includes('/chat')) {
                showNotification("New Message", {
                    body: data.message?.message || "You have a new message",
                    tag: data.message?.chatUid || 'chat-notification',
                    data: { chatUid: data.message?.chatUid },
                });
            }
        };
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("user.message", handleNewMessage);
        if (socket.connected) {
            socket.emit('getOnlineUsers');
        }
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("user.message", handleNewMessage);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return null;
}, (prevProps, nextProps) => prevProps.socket.id === nextProps.socket.id);
