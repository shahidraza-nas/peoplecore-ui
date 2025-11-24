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
    memo,
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

interface SocketContextType {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
    undefined
);


let globalSocket: Socket | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
let hasInitialized = false; // Prevent multiple socket creations globally
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const session = useSession();
    const token = session.data?.user?.accessToken;
    const previousToken = useRef<string | undefined>(undefined);
    const mountedRef = useRef(true);
    const effectRunCount = useRef(0); // Track how many times effect runs

    useEffect(() => {
        mountedRef.current = true;
        effectRunCount.current += 1;

        console.log(`[Socket Provider] Effect #${effectRunCount.current} - Token:`, token ? `${token.substring(0, 10)}...` : 'none', 'GlobalSocket:', !!globalSocket, 'Connected:', globalSocket?.connected, 'hasInit:', hasInitialized);

        // CRITICAL: Only proceed if we have a valid token
        if (!token) {
            console.log('[Socket Provider] No token, cleaning up');
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
            console.log('[Socket Provider] Token changed, disconnecting old socket');
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                isConnecting = false;
                hasInitialized = false;
            }
        }

        previousToken.current = token;

        // If we already have a connected socket, DON'T call setSocket again to avoid re-renders
        if (globalSocket && globalSocket.connected) {
            console.log('[Socket Provider] Socket already connected:', globalSocket.id, 'State already set:', socket === globalSocket);
            // CRITICAL: Only set state if it's null or undefined, never replace the same socket
            if (mountedRef.current && !socket) {
                console.log('[Socket Provider] Setting existing socket to state (first time)');
                setSocket(globalSocket);
            }
            return;
        }

        // If we're already in the process of connecting, don't create another
        if (isConnecting) {
            console.log('[Socket Provider] Already connecting, skipping...');
            return;
        }

        // If socket exists but is disconnected, let it auto-reconnect, don't create new one
        if (globalSocket && !globalSocket.connected) {
            console.log('[Socket Provider] Socket exists but disconnected, letting it auto-reconnect');
            // Only set state if not already set
            if (mountedRef.current && !socket) {
                console.log('[Socket Provider] Setting disconnected socket to state (will auto-reconnect)');
                setSocket(globalSocket);
            }
            return;
        }

        // CRITICAL: Prevent multiple socket creations even if effect runs multiple times
        if (hasInitialized && globalSocket) {
            console.log('[Socket Provider] Socket already initialized, skipping creation');
            if (mountedRef.current && !socket) {
                setSocket(globalSocket);
            }
            return;
        }

        isConnecting = true;
        hasInitialized = true;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        console.log('[Socket] Creating new socket connection to:', apiUrl);

        const socketIO = io(apiUrl, {
            transports: ["websocket"],
            query: { token },
            reconnection: false, // DISABLE auto-reconnect to debug
            autoConnect: true,
            forceNew: false, // Don't create new connection if one exists
            multiplex: true, // Share single connection
        });

        socketIO.on('connect', () => {
            const wasReconnecting = reconnectAttempts > 0;
            isConnecting = false;
            reconnectAttempts = 0;
            console.log('[Socket] Connected successfully', socketIO.id);

            // Show success toast only if this was a reconnection
            if (wasReconnecting) {
                toast.success('Connected to chat server', { duration: 2000 });
            }
        });

        socketIO.on('connect_error', (error) => {
            isConnecting = false;
            reconnectAttempts++;

            const errorMessage = error.message.toLowerCase();

            // Handle authentication errors - show to user and redirect
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
                console.warn('[Socket] Authentication error - token expired');
                toast.error('Session expired. Please login again.');
                // Don't log error to console - this will be handled by redirect
                return;
            }

            // Handle server unavailable (restart, network issues)
            // Only log in development, don't show to user unless max attempts reached
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Socket] Connection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} failed`);
            }

            // Show user-friendly message only after max attempts
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                toast.error('Unable to connect to chat server. Retrying...', { duration: 3000 });
            }
        });

        socketIO.on('disconnect', (reason) => {
            isConnecting = false;
            console.log('[Socket] Disconnected:', reason, 'Socket ID:', socketIO.id);

            // Log different disconnect reasons appropriately
            if (reason === 'io server disconnect') {
                // Server explicitly disconnected this client
                console.warn('[Socket] Server disconnected the connection - may indicate auth issue');
            } else if (reason === 'io client disconnect') {
                // Client called socket.disconnect()
                console.log('[Socket] Client disconnected intentionally');
            } else if (reason === 'transport close' || reason === 'transport error') {
                // Network issue or server down - don't spam console
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Socket] Connection lost - will auto-reconnect');
                }
            }
        });

        socketIO.on('reconnect_attempt', (attemptNumber) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
            }
        });

        socketIO.on('reconnect_failed', () => {
            console.warn('[Socket] Reconnection failed after max attempts');
            toast.error('Chat connection unavailable. Please refresh the page.', {
                duration: 5000,
                icon: '🔌'
            });
        });

        socketIO.on('error', (error) => {
            // Log errors silently in production, show in development
            if (process.env.NODE_ENV === 'development') {
                console.error('[Socket] Error:', error);
            }
        });

        globalSocket = socketIO;
        if (mountedRef.current) {
            console.log('[Socket Provider] Setting NEW socket to state');
            setSocket(socketIO);
        }
        return () => {
            mountedRef.current = false;
            // Do NOT disconnect global socket on unmount, it should persist
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
        console.log('[Socket] Manually disconnecting socket');
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

    // Initialize Firebase Cloud Messaging
    useEffect(() => {
        if (fcmInitialized.current) return;

        const initializeFCM = async () => {
            try {
                // Check if we already have a token stored
                const existingToken = getFcmTokenFromStorage();

                if (!existingToken) {
                    // Request permission and get token
                    const fcmToken = await requestNotificationPermission();

                    if (fcmToken) {
                        saveFcmTokenToStorage(fcmToken);
                        console.log("[FCM] Token obtained and saved:", fcmToken);
                    }
                }

                // Listen for foreground messages
                const unsubscribe = onMessageListener((payload) => {
                    console.log("[FCM] Foreground message received:", payload);

                    const title = payload?.notification?.title || payload?.data?.title || "New Message";
                    const body = payload?.notification?.body || payload?.data?.body || "You have a new message";

                    // Show browser notification
                    showNotification(title, {
                        body,
                        tag: payload?.data?.chatUid || 'chat-notification',
                        data: payload?.data,
                        requireInteraction: true,
                    });

                    // Show toast notification
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

        // Track socket ID changes to detect new instances
        if (socketIdRef.current !== socket.id) {
            console.log('[SocketEvents] New socket instance detected:', socketIdRef.current, '->', socket.id);
            socketIdRef.current = socket.id;
        }

        const handleConnect = () => {
            console.log('[SocketEvents] Socket connected, ID:', socket.id);
            socket.emit('getOnlineUsers');
        };

        const handleDisconnect = (reason: string) => {
            // Disconnect is already handled in the main socket setup
            // This is just for component-level handling if needed
            console.log('[SocketEvents] Socket disconnected:', reason);
        };

        const handleConnectError = (error: Error) => {
            const errorMessage = error.message.toLowerCase();

            // Only handle auth errors here - redirect to login
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
                console.warn('[SocketEvents] Auth error detected, disconnecting and redirecting');
                disconnectSocket();
                router.push('/login?expired=true');
            }
            // Network errors are handled in the main socket setup
        };

        // Listen for incoming messages from socket
        const handleNewMessage = (data: any) => {
            console.log("[Socket] New message received:", data);

            // Show notification for new messages when not on chat page
            if (!window.location.pathname.includes('/chat')) {
                showNotification("New Message", {
                    body: data.message?.message || "You have a new message",
                    tag: data.message?.chatUid || 'chat-notification',
                    data: { chatUid: data.message?.chatUid },
                });
            }
        };

        console.log('[SocketEvents] Setting up event listeners');
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("user.message", handleNewMessage);

        // Only emit if already connected
        if (socket.connected) {
            console.log('[SocketEvents] Socket already connected, requesting online users');
            socket.emit('getOnlineUsers');
        }

        return () => {
            console.log('[SocketEvents] Cleaning up event listeners');
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("user.message", handleNewMessage);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]); // socket intentionally excluded to prevent re-running on reference changes

    return null;
}, (prevProps, nextProps) => {
    // Only re-render if socket.id changes (new socket instance)
    return prevProps.socket.id === nextProps.socket.id;
});
