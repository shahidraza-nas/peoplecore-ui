'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { onMessage, offMessage, onTyping, offTyping, onUserOnline, offUserOnline, onUserOffline, offUserOffline, onOnlineUsersList, offOnlineUsersList, emitMessage, emitTyping, onMessagesRead, offMessagesRead } from '@/lib/socket';
import { useSocketContext } from '@/contexts/socket';
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

    const { socket } = useSocketContext();

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

    console.log('[useChat] RENDER - Socket:', !!socket, 'Connected:', socket?.connected, 'ID:', socket?.id);

    useEffect(() => {
        console.log('[useChat] Message listener effect - socket:', !!socket, 'connected:', socket?.connected, 'activeChat:', activeChat?.uid);

        if (!socket) {
            console.warn('[useChat] No socket available for message listening');
            return;
        }

        const handleNewMessage = (data: { message: ChatMessage }) => {
            console.log('[useChat] RECEIVED NEW MESSAGE:', data.message);
            const newMessage = data.message;

            if (activeChat && newMessage.chatId === activeChat.id) {
                console.log('[useChat] Message is for active chat, adding to messages');
                setMessages((prev) => {
                    if (prev.some((m) => m.uid === newMessage.uid)) {
                        console.log('[useChat] Message already exists, skipping');
                        return prev;
                    }
                    console.log('[useChat] Adding message to state');
                    return [...prev, newMessage];
                });
            } else {
                console.log('[useChat] Message is NOT for active chat:', { messageChat: newMessage.chatId, activeChat: activeChat?.id });
            }

            setChats((prevChats) => {
                const updatedChats = prevChats.map((chat) => {
                    if (chat.id === newMessage.chatId) {
                        return {
                            ...chat,
                            messages: [newMessage],
                            updated_at: newMessage.created_at,
                        };
                    }
                    return chat;
                });
                return updatedChats.sort((a, b) => {
                    const aTime = a.messages?.[0]?.created_at || a.updated_at || a.created_at;
                    const bTime = b.messages?.[0]?.created_at || b.updated_at || b.created_at;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });
            });
        };

        console.log('[useChat] Attaching message listener');
        onMessage(socket, handleNewMessage);

        return () => {
            console.log('[useChat] Cleaning up message listener');
            offMessage(socket, handleNewMessage);
        };
    }, [socket, activeChat]);

    useEffect(() => {
        if (!socket) return;

        const handleTyping = (data: { userId: number; chatUid: string; isTyping: boolean }) => {
            console.log('[useChat] Received typing event:', data);
            if (activeChat && data.chatUid === activeChat.uid) {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    if (data.isTyping) {
                        newSet.add(data.userId);
                        console.log('[useChat] User typing:', data.userId);
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                        }
                        typingTimeoutRef.current[data.userId] = setTimeout(() => {
                            setTypingUsers((s) => {
                                const updated = new Set(s);
                                updated.delete(data.userId);
                                return updated;
                            });
                        }, 3000);
                    } else {
                        newSet.delete(data.userId);
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                        }
                    }
                    return newSet;
                });
            }
        };

        onTyping(socket, handleTyping);

        return () => {
            offTyping(socket, handleTyping);
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
        };
    }, [socket, activeChat]);

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = (data: { userId: number }) => {
            console.log('[useChat] User came online:', data.userId);
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(data.userId);
                return newSet;
            });
        };

        const handleUserOffline = (data: { userId: number }) => {
            console.log('[useChat] User went offline:', data.userId);
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };

        const handleOnlineUsersList = (data: { userIds: number[] }) => {
            console.log('[useChat] Received online users list:', data.userIds);
            setOnlineUsers(new Set(data.userIds));
        };

        onUserOnline(socket, handleUserOnline);
        onUserOffline(socket, handleUserOffline);
        onOnlineUsersList(socket, handleOnlineUsersList);

        return () => {
            offUserOnline(socket, handleUserOnline);
            offUserOffline(socket, handleUserOffline);
            offOnlineUsersList(socket, handleOnlineUsersList);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessagesRead = (data: { chatUid: string; readBy: number }) => {
            console.log('[useChat] Messages marked as read:', data);
            if (activeChat && data.chatUid === activeChat.uid) {
                setMessages((prev) =>
                    prev.map((msg) => ({ ...msg, isRead: true }))
                );
            }
            setChats((prev) =>
                prev.map((chat) =>
                    chat.uid === data.chatUid
                        ? {
                            ...chat,
                            messages: chat.messages?.map((msg) => ({ ...msg, isRead: true })),
                        }
                        : chat
                )
            );
        };

        onMessagesRead(socket, handleMessagesRead);

        return () => {
            offMessagesRead(socket, handleMessagesRead);
        };
    }, [socket, activeChat]);

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
            const loadedChats = response.data?.chats || [];
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

    useEffect(() => {
        if (user && !chatsLoaded.current) {
            loadChats();
        }
    }, [user?.id]);

    useEffect(() => {
        if (activeChat) {
            isLoadingMessages.current = false;
            loadMessages(0);
            setMessageOffset(0);
            setHasMore(true);
            markAsRead(activeChat.uid);
        } else {
            setMessages([]);
        }
    }, [activeChat?.uid]);

    const sendMessage = useCallback(async (toUserUid: string, message: string) => {
        if (!user || !message.trim()) return;

        setSending(true);
        try {
            const response = await apiSendMessage({ toUserUid, message: message.trim() });
            if (!response.success || response.error) {
                toast.error('Failed to send message');
                return;
            }
            const sentMessage = response.data?.message;
            if (sentMessage) {
                setChats((prevChats) => {
                    const updatedChats = prevChats.map((chat) =>
                        chat.id === sentMessage.chatId
                            ? { ...chat, messages: [sentMessage], updated_at: sentMessage.created_at }
                            : chat
                    );
                    return updatedChats.sort((a, b) => {
                        const aTime = a.messages?.[0]?.created_at || a.updated_at || a.created_at;
                        const bTime = b.messages?.[0]?.created_at || b.updated_at || b.created_at;
                        return new Date(bTime).getTime() - new Date(aTime).getTime();
                    });
                });
            }

            if (socket?.connected) {
                console.log('[useChat] Emitting message via socket');
                emitMessage(socket, { toUserUid, message: message.trim() });
            } else {
                console.warn('[useChat] Socket not connected, message sent via API only');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    }, [user, socket]);

    const loadMoreMessages = useCallback(async () => {
        if (!hasMore || loading) return;
        await loadMessages(messageOffset + 50);
    }, [hasMore, loading, messageOffset, loadMessages]);

    const markAsRead = useCallback(async (chatUid: string) => {
        try {
            await markChatAsRead(chatUid);
            setMessages((prev) =>
                prev.map((msg) => (msg.chatId === activeChat?.id ? { ...msg, isRead: true } : msg))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [activeChat]);

    const refreshChats = useCallback(async () => {
        await loadChats();
    }, [loadChats]);
    const setTyping = useCallback((toUserId: number, isTyping: boolean, chatUid: string) => {
        if (socket?.connected) {
            emitTyping(socket, { toUserId, isTyping, chatUid });
        }
    }, [socket]);

    const createNewChat = useCallback(async (userUid: string): Promise<Chat | null> => {
        try {
            console.log('useChat: Creating new chat with userUid:', userUid);
            const { createChat } = await import('@/actions/chat.action');
            const response = await createChat(userUid);

            console.log('useChat: Create chat response:', {
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
                console.error('useChat: Chat creation failed:', errorMsg);
                toast.error(errorMsg);
                return null;
            }

            const chat = response.data?.chat || null;
            if (!chat) {
                console.error('useChat: No chat in response data');
                toast.error('Invalid response from server');
                return null;
            }

            console.log('useChat: Chat created successfully:', chat?.uid);
            return chat;
        } catch (error) {
            console.error('useChat: Exception creating chat:', error);
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
