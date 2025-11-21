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
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; 

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
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: RECONNECT_DELAY,
            autoConnect: true,
        });

        socketIO.on('connect', () => {
            isConnecting = false;
            reconnectAttempts = 0;
            console.log('[Socket] Connected successfully');
            
            // Show success toast only if this was a reconnection
            if (reconnectAttempts > 0) {
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
            
            // Log different disconnect reasons appropriately
            if (reason === 'io server disconnect') {
                // Server explicitly disconnected this client
                console.log('[Socket] Server disconnected the connection');
            } else if (reason === 'io client disconnect') {
                // Client called socket.disconnect()
                console.log('[Socket] Client disconnected');
            } else if (reason === 'transport close' || reason === 'transport error') {
                // Network issue or server down - don't spam console
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Socket] Connection lost - will auto-reconnect');
                }
            } else {
                console.log('[Socket] Disconnected:', reason);
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

export function SocketEvents({ socket }: { socket: Socket }) {
    const router = useRouter();
    const fcmInitialized = useRef(false);

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
        const handleConnect = () => {
            socket.emit('getOnlineUsers');
        };

        const handleDisconnect = (reason: string) => {
            // Disconnect is already handled in the main socket setup
            // This is just for component-level handling if needed
        };

        const handleConnectError = (error: Error) => {
            const errorMessage = error.message.toLowerCase();
            
            // Only handle auth errors here - redirect to login
            if (errorMessage.includes('jwt expired') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication')) {
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
    }, [socket, router]);

    return null;
}
