'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket, onMessage, offMessage, onTyping, offTyping, onUserOnline, offUserOnline, onUserOffline, offUserOffline, emitMessage, emitTyping, getSocket } from '@/lib/socket';
import {
    getMyChats,
    getChatMessages,
    sendMessage as apiSendMessage,
    markChatAsRead,
} from '@/actions/chat.action';
import type { Chat, ChatMessage, User } from '@/lib/types';
import { toast } from 'react-hot-toast';

export interface UseChatReturn {
    chats: Chat[];
    activeChat: Chat | null;
    messages: ChatMessage[];
    loading: boolean;
    sending: boolean;
    typingUsers: Set<number>;
    onlineUsers: Set<number>;
    setActiveChat: (chat: Chat | null) => void;
    sendMessage: (toUserUid: string, message: string) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    markAsRead: (chatUid: string) => Promise<void>;
    refreshChats: () => Promise<void>;
    setTyping: (toUserId: number, isTyping: boolean, chatUid: string) => void;
    createNewChat: (userUid: string) => Promise<Chat | null>;
}

export const useChat = (user: User | null): UseChatReturn => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const [messageOffset, setMessageOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
    const isLoadingChats = useRef(false);
    const isLoadingMessages = useRef(false);
    const chatsLoaded = useRef(false);

    useEffect(() => {
        if (!user) return;
        const token = (user as any)?.accessToken;
        if (!token) {
            console.error('No access token found in user session:', {
                hasUser: !!user,
                userId: user?.id,
                userKeys: Object.keys(user || {}),
            });
            toast.error('Authentication error - please login again');
            return;
        }

        console.log('🔌 Connecting to chat socket with token');
        try {
            const socket = connectSocket(token);
            console.log('Chat socket initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chat socket:', error);
            toast.error('Failed to connect to chat service');
        }

        return () => {
            disconnectSocket();
        };
    }, [user]);

    useEffect(() => {
        const handleNewMessage = (data: { message: ChatMessage }) => {
            const newMessage = data.message;

            if (activeChat && newMessage.chatId === activeChat.id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.uid === newMessage.uid)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });
            }
            // Update chat with new message and move to top
            setChats((prevChats) => {
                const updatedChats = prevChats.map((chat) =>
                    chat.id === newMessage.chatId
                        ? { ...chat, messages: [newMessage], updated_at: newMessage.created_at }
                        : chat
                );
                // Sort by most recent message/update
                return updatedChats.sort((a, b) => {
                    const aTime = a.messages?.[0]?.created_at || a.updated_at || a.created_at;
                    const bTime = b.messages?.[0]?.created_at || b.updated_at || b.created_at;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });
            });
        };

        onMessage(handleNewMessage);

        return () => {
            offMessage(handleNewMessage);
        };
    }, [activeChat]);

    useEffect(() => {
        const handleTyping = (data: { userId: number; chatUid: string; isTyping: boolean }) => {
            console.log('📬 Received typing event:', {
                userId: data.userId,
                chatUid: data.chatUid,
                isTyping: data.isTyping,
                activeChat: activeChat?.uid,
                matches: activeChat && data.chatUid === activeChat.uid
            });
            if (activeChat && data.chatUid === activeChat.uid) {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    if (data.isTyping) {
                        newSet.add(data.userId);
                        console.log('✅ Added user to typing set:', data.userId, 'Total typing:', newSet.size);
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                        }
                        typingTimeoutRef.current[data.userId] = setTimeout(() => {
                            setTypingUsers((s) => {
                                const updated = new Set(s);
                                updated.delete(data.userId);
                                console.log('⏰ Auto-removed user from typing (timeout):', data.userId);
                                return updated;
                            });
                        }, 3000);
                    } else {
                        newSet.delete(data.userId);
                        console.log('🛑 Removed user from typing set:', data.userId);
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                        }
                    }
                    return newSet;
                });
            }
        };

        onTyping(handleTyping);

        return () => {
            offTyping(handleTyping);
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
        };
    }, [activeChat]);

    // Handle user online/offline status
    useEffect(() => {
        const handleUserOnline = (data: { userId: number }) => {
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(data.userId);
                return newSet;
            });
        };

        const handleUserOffline = (data: { userId: number }) => {
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };

        onUserOnline(handleUserOnline);
        onUserOffline(handleUserOffline);

        return () => {
            offUserOnline(handleUserOnline);
            offUserOffline(handleUserOffline);
        };
    }, []);

    const loadChats = useCallback(async () => {
        if (!user || isLoadingChats.current) return;

        isLoadingChats.current = true;
        setLoading(true);
        try {
            const response = await getMyChats({ offset: 0, limit: 50 });
            if (!response.success || response.error) {
                toast.error('Failed to load chats');
                return;
            }
            // Server action returns { success: true, data: { chats: [...], count: X } }
            const loadedChats = response.data?.chats || [];
            // Sort by most recent message/update
            const sortedChats = loadedChats.sort((a, b) => {
                const aTime = a.messages?.[0]?.created_at || a.updated_at || a.created_at;
                const bTime = b.messages?.[0]?.created_at || b.updated_at || b.created_at;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
            setChats(sortedChats);
            chatsLoaded.current = true;
        } catch (error) {
            toast.error('Failed to load chats');
        } finally {
            setLoading(false);
            isLoadingChats.current = false;
        }
    }, [user]);

    const loadMessages = useCallback(async (offset: number = 0) => {
        if (!activeChat || isLoadingMessages.current) return;

        isLoadingMessages.current = true;
        setLoading(true);
        try {
            const response = await getChatMessages(activeChat.uid, { offset, limit: 50 });
            if (!response.success || response.error) {
                toast.error('Failed to load messages');
                return;
            }

            // Server action returns { success: true, data: { messages: [...], count: X } }
            const newMessages = response.data?.messages || [];
            setHasMore(newMessages.length === 50);

            if (offset === 0) {
                setMessages(newMessages.reverse());
            } else {
                setMessages((prev) => [...newMessages.reverse(), ...prev]);
            }
            setMessageOffset(offset);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
            isLoadingMessages.current = false;
        }
    }, [activeChat]);

    // Initial load - only once when user is available
    useEffect(() => {
        if (user && !chatsLoaded.current) {
            loadChats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]); // Only depend on user.id to prevent re-running

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            isLoadingMessages.current = false; // Reset loading flag for new chat
            loadMessages(0);
            setMessageOffset(0);
            setHasMore(true);
        } else {
            setMessages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat?.uid]); // Only depend on chat UID to prevent re-running

    // Send message
    const sendMessage = useCallback(async (toUserUid: string, message: string) => {
        if (!user || !message.trim()) return;

        setSending(true);
        try {
            const response = await apiSendMessage({ toUserUid, message: message.trim() });
            if (!response.success || response.error) {
                toast.error('Failed to send message');
                return;
            }

            // Update chat order after sending message
            const sentMessage = response.data?.message;
            if (sentMessage) {
                setChats((prevChats) => {
                    const updatedChats = prevChats.map((chat) =>
                        chat.id === sentMessage.chatId
                            ? { ...chat, messages: [sentMessage], updated_at: sentMessage.created_at }
                            : chat
                    );
                    // Sort by most recent
                    return updatedChats.sort((a, b) => {
                        const aTime = a.messages?.[0]?.created_at || a.updated_at || a.created_at;
                        const bTime = b.messages?.[0]?.created_at || b.updated_at || b.created_at;
                        return new Date(bTime).getTime() - new Date(aTime).getTime();
                    });
                });
            }
            
            // Optionally emit via socket for instant feedback
            const socket = getSocket();
            if (socket?.connected) {
                emitMessage({ toUserUid, message: message.trim() });
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    }, [user]);

    // Load more messages (pagination)
    const loadMoreMessages = useCallback(async () => {
        if (!hasMore || loading) return;
        await loadMessages(messageOffset + 50);
    }, [hasMore, loading, messageOffset, loadMessages]);

    // Mark chat as read
    const markAsRead = useCallback(async (chatUid: string) => {
        try {
            await markChatAsRead(chatUid);
            // Update local state
            setMessages((prev) =>
                prev.map((msg) => (msg.chatId === activeChat?.id ? { ...msg, isRead: true } : msg))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [activeChat]);

    // Refresh chats
    const refreshChats = useCallback(async () => {
        await loadChats();
    }, [loadChats]);

    // Set typing indicator
    const setTyping = useCallback((toUserId: number, isTyping: boolean, chatUid: string) => {
        emitTyping({ toUserId, isTyping, chatUid });
    }, []);

    // Create new chat
    const createNewChat = useCallback(async (userUid: string): Promise<Chat | null> => {
        try {
            console.log('🟢 useChat: Creating new chat with userUid:', userUid);
            const { createChat } = await import('@/actions/chat.action');
            const response = await createChat(userUid);

            console.log('🟢 useChat: Create chat response:', {
                success: response.success,
                hasData: !!response.data,
                hasChat: !!response.data?.chat,
                error: response.error,
                fullResponse: response
            });

            if (!response.success || response.error) {
                const errorMsg = typeof response.error === 'string' 
                    ? response.error 
                    : response.error?.message || 'Failed to create chat';
                console.error('❌ useChat: Chat creation failed:', errorMsg);
                toast.error(errorMsg);
                return null;
            }

            const chat = response.data?.chat || null;
            if (!chat) {
                console.error('❌ useChat: No chat in response data');
                toast.error('Invalid response from server');
                return null;
            }
            
            console.log('✅ useChat: Chat created successfully:', chat?.uid);
            return chat;
        } catch (error) {
            console.error('❌ useChat: Exception creating chat:', error);
            const errorMsg = error instanceof Error ? error.message : 'Failed to create chat';
            toast.error(errorMsg);
            return null;
        }
    }, []);

    return {
        chats,
        activeChat,
        messages,
        loading,
        sending,
        typingUsers,
        onlineUsers,
        setActiveChat,
        sendMessage,
        loadMoreMessages,
        markAsRead,
        refreshChats,
        setTyping,
        createNewChat,
    };
};
