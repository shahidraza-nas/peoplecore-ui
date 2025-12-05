'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { onMessage, offMessage, onTyping, offTyping, onUserOnline, offUserOnline, onUserOffline, offUserOffline, onOnlineUsersList, offOnlineUsersList, emitTyping, emitMessage, onMessagesRead, offMessagesRead } from '@/lib/socket';
import { useSocketContext } from '@/contexts/socket';
import {
    getMyChats,
    getChatMessages,
    markChatAsRead,
} from '@/actions/chat.action';
import type { Chat, ChatMessage, User } from '@/types';
import { toast } from 'sonner';
import { isSubscriptionError, showSubscriptionError } from '@/lib/utils';

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
    const markAsReadInProgressRef = useRef<Set<string>>(new Set());

    useEffect(() => {

        if (!socket) {
            return;
        }

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

            // Refresh user context to update unread count badge
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-read'));
            }
        };

        onMessage(socket, handleNewMessage);

        return () => {
            offMessage(socket, handleNewMessage);
        };
    }, [socket, activeChat]);

    useEffect(() => {
        if (!socket) return;

        const handleTyping = (data: { userId: number; chatUid: string; isTyping: boolean }) => {
            if (activeChat && data.chatUid === activeChat.uid) {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    if (data.isTyping) {
                        newSet.add(data.userId);
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

        const handleOnlineUsersList = (data: { userIds: number[] }) => {
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
            
            // Only update messages that were TO the reader (not sent BY the reader)
            if (activeChat && data.chatUid === activeChat.uid) {
                setMessages((prev) =>
                    prev.map((msg) => 
                        msg.toUserId === data.readBy && msg.fromUserId !== data.readBy
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
            }
            
            // Update chat list: mark messages as read and reset unread_count
            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.uid === data.chatUid) {
                        return {
                            ...chat,
                            messages: chat.messages?.map((msg) =>
                                msg.toUserId === data.readBy && msg.fromUserId !== data.readBy
                                    ? { ...msg, isRead: true }
                                    : msg
                            ),
                            // Reset unread count if current user marked as read
                            unread_count: data.readBy === user?.id ? 0 : chat.unread_count,
                        };
                    }
                    return chat;
                })
            );
        };

        onMessagesRead(socket, handleMessagesRead);

        return () => {
            offMessagesRead(socket, handleMessagesRead);
        };
    }, [socket, activeChat, user?.id]);

    const loadChats = useCallback(async () => {
        if (!user || isLoadingChats.current) return;

        isLoadingChats.current = true;
        setLoading(true);
        try {
            const response = await getMyChats({ offset: 0, limit: 50 });
            if (!response.success || response.error) {
                if (isSubscriptionError(response.error)) {
                    showSubscriptionError();
                } else {
                    toast.error('Unable to load your conversations. Please try again.');
                }
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
            console.error('Error loading chats:', error);
            toast.error('Unable to connect to chat service. Please check your connection.');
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
                if (isSubscriptionError(response.error)) {
                    showSubscriptionError();
                } else {
                    toast.error('Failed to load messages');
                }
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

    // Mark as read function - defined before sendMessage to avoid hoisting issues
    const markAsRead = useCallback(async (chatUid: string) => {
        // Deduplication: prevent multiple concurrent API calls for same chat
        if (markAsReadInProgressRef.current.has(chatUid)) {
            return;
        }

        markAsReadInProgressRef.current.add(chatUid);

        try {
            const result = await markChatAsRead(chatUid);

            if (!result.success) {
                console.error('[useChat] Failed to mark as read:', result.error);
                
                if (isSubscriptionError(result.error)) {
                    showSubscriptionError();
                } else {
                    toast.error('Failed to mark messages as read');
                }
                return;
            }

            // Update messages in current chat - only messages TO current user
            setMessages((prev) =>
                prev.map((msg) => 
                    msg.chatId === activeChat?.id && msg.toUserId === user?.id
                        ? { ...msg, isRead: true }
                        : msg
                )
            );

            // Update chats list to set unread_count to 0 for this chat
            setChats((prev) =>
                prev.map((chat) =>
                    chat.uid === chatUid ? { ...chat, unread_count: 0 } : chat
                )
            );

            // Immediately trigger refresh without delay for instant UI update
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-read'));
            }
        } catch (error) {
            console.error('[useChat] Exception in markAsRead:', error);
        } finally {
            // Always remove from in-progress set
            markAsReadInProgressRef.current.delete(chatUid);
        }
    }, [activeChat, user?.id]);

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
    }, [activeChat?.uid, markAsRead]);

    const sendMessage = useCallback(async (toUserUid: string, message: string) => {
        if (!user || !message.trim() || !socket?.connected || !activeChat) {
            toast.error('Cannot send message. Please check your connection.');
            return;
        }

        setSending(true);
        try {
            // Send message via WebSocket
            emitMessage(socket, { 
                toUserUid, 
                chatUid: activeChat.uid, 
                message: message.trim() 
            });

            // Auto-mark as read when sending message (user is actively engaged in chat)
            await markAsRead(activeChat.uid);

            // Refresh unread count after sending to update bell icon
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-read'));
            }
        } catch (error) {
            console.error('[useChat] Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    }, [user, socket, activeChat, markAsRead]);

    const loadMoreMessages = useCallback(async () => {
        if (!hasMore || loading) return;
        await loadMessages(messageOffset + 50);
    }, [hasMore, loading, messageOffset, loadMessages]);

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
            const { createChat } = await import('@/actions/chat.action');
            const response = await createChat(userUid);

            if (!response.success || response.error) {
                console.error('useChat: Chat creation failed:', response.error);
                
                if (isSubscriptionError(response.error)) {
                    showSubscriptionError('Active subscription required to create chats');
                } else {
                    const errorMsg = typeof response.error === 'string'
                        ? response.error
                        : response.error?.message || 'Failed to create chat';
                    toast.error(errorMsg);
                }
                return null;
            }

            const chat = response.data?.chat || null;
            if (!chat) {
                console.error('useChat: No chat in response data');
                toast.error('Invalid response from server');
                return null;
            }

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
