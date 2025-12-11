'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, ChatMessage, User } from '@/types';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';

interface ChatWindowProps {
    activeChat: Chat | null;
    messages: ChatMessage[];
    currentUser: User | null;
    loading: boolean;
    sending: boolean;
    typingUsers: Set<number>;
    onlineUsers: Set<number>;
    onSendMessage: (toUserUid: string, message: string) => Promise<void>;
    onMarkAsRead: (chatUid: string) => Promise<void>;
    onTyping: (toUserId: number, isTyping: boolean, chatUid: string) => void;
    onLoadMoreMessages: () => Promise<void>;
}

export function ChatWindow({
    activeChat,
    messages,
    currentUser,
    loading,
    sending,
    typingUsers,
    onlineUsers,
    onSendMessage,
    onMarkAsRead,
    onTyping,
    onLoadMoreMessages,
}: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const hasMarkedAsReadRef = useRef<string | null>(null);
    const previousMessageCountRef = useRef<number>(0);
    const previousScrollHeightRef = useRef<number>(0);
    const isLoadingMoreRef = useRef<boolean>(false);
    const autoMarkDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastAutoMarkCountRef = useRef<number>(0);

    const otherUser = activeChat && currentUser && activeChat.user1 && activeChat.user2
        ? Number(activeChat.user1.id) === Number(currentUser.id)
            ? activeChat.user2
            : activeChat.user1
        : null;

    useEffect(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        const previousCount = previousMessageCountRef.current;
        const currentCount = messages.length;

        // If loading more (messages prepended to beginning)
        if (isLoadingMoreRef.current && currentCount > previousCount) {
            const previousScrollHeight = previousScrollHeightRef.current;
            const currentScrollHeight = scrollContainer.scrollHeight;
            const scrollHeightDiff = currentScrollHeight - previousScrollHeight;

            // Maintain scroll position by adjusting for new content height
            scrollContainer.scrollTop = scrollHeightDiff;
            isLoadingMoreRef.current = false;
        }
        // New message arrived or initial load - scroll to bottom
        else if (currentCount > previousCount || previousCount === 0) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }

        previousMessageCountRef.current = currentCount;
    }, [messages]);

    // Scroll detection for loading more messages (scroll to top)
    useEffect(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop } = scrollContainer;
            const isNearTop = scrollTop < 100;

            if (isNearTop && !loading && !isLoadingMoreRef.current) {
                isLoadingMoreRef.current = true;
                previousScrollHeightRef.current = scrollContainer.scrollHeight;
                onLoadMoreMessages();
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [loading, onLoadMoreMessages]);

    useEffect(() => {
        if (activeChat && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [activeChat]);

    /**
     * Reset state when switching between chats
     * Clears the marked-as-read flag and message count to ensure
     * proper auto-marking behavior for the new conversation
     */
    useEffect(() => {
        hasMarkedAsReadRef.current = null;
        lastAutoMarkCountRef.current = 0;
    }, [activeChat?.uid]);

    /**
     * Initial mark as read when opening a chat with unread messages
     * 
     * This effect runs ONCE per chat when it's first opened.
     * It waits 300ms for messages to load, then marks any unread messages.
     * 
     * Note: Does NOT depend on messages array to avoid re-running on every change.
     * The auto-mark effect below handles new incoming messages.
     */
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        if (hasMarkedAsReadRef.current === activeChat.uid) return;

        const timer = setTimeout(() => {
            const hasUnread = messages.some(
                (m) => !m.isRead && m.toUserId == currentUser.id
            );

            if (hasUnread) {
                onMarkAsRead(activeChat.uid);
            }
            hasMarkedAsReadRef.current = activeChat.uid;
        }, 300);

        return () => clearTimeout(timer);
    }, [activeChat?.uid, currentUser?.id]);

    /**
     * Auto-mark new messages as read when they arrive while chat window is open
     * 
     * This effect triggers when:
     * - A new message is added to the messages array
     * - The chat window is currently viewing this conversation
     * - The tab/window is visible
     * 
     * Important: Uses loose equality (==) for ID comparison because
     * currentUser.id is a string while message.toUserId is a number.
     * 
     * The 500ms debounce prevents rapid API calls when multiple messages
     * arrive in quick succession.
     */
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        const hasNewMessages = messages.length > lastAutoMarkCountRef.current;
        const previousCount = lastAutoMarkCountRef.current;
        lastAutoMarkCountRef.current = messages.length;

        if (!hasNewMessages || previousCount === 0) {
            return;
        }

        const unreadMessages = messages.filter(
            (m) => !m.isRead && m.toUserId == currentUser.id
        );

        if (unreadMessages.length === 0) {
            return;
        }

        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
        }

        if (autoMarkDebounceRef.current) {
            clearTimeout(autoMarkDebounceRef.current);
        }

        autoMarkDebounceRef.current = setTimeout(() => {
            onMarkAsRead(activeChat.uid);
        }, 500);

        return () => {
            if (autoMarkDebounceRef.current) {
                clearTimeout(autoMarkDebounceRef.current);
            }
        };
    }, [messages, activeChat?.uid, currentUser?.id, onMarkAsRead]);

    /**
     * Mark messages as read when user returns to the tab
     * 
     * Handles the case where messages arrive while the tab is hidden/backgrounded.
     * When the user switches back to the tab, any unread messages are marked as read.
     */
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const hasUnread = messages.some(
                    (m) => !m.isRead && m.toUserId == currentUser.id
                );
                if (hasUnread) {
                    onMarkAsRead(activeChat.uid);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeChat?.uid, currentUser?.id, messages, onMarkAsRead]);

    const handleSend = async () => {
        if (!messageText.trim() || !otherUser || sending) return;
        const text = messageText.trim();
        setMessageText('');
        if (activeChat) {
            onTyping(otherUser.id, false, activeChat.uid);
        }
        await onSendMessage(otherUser.uid, text);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);
        if (activeChat && otherUser) {
            onTyping(otherUser.id, true, activeChat.uid);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(otherUser.id, false, activeChat.uid);
            }, 1000);
        }
    };

    if (!activeChat) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium">No chat selected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Select a conversation to start messaging
                    </p>
                </div>
            </div>
        );
    }

    const isConsecutive = (index: number) => {
        if (index === 0) return false;
        const currentMsg = messages[index];
        const prevMsg = messages[index - 1];
        return currentMsg.fromUserId === prevMsg.fromUserId;
    };

    return (
        <div className="flex h-full flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-3 shrink-0">
                <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                            {otherUser?.name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2) || '?'}
                        </span>
                    </div>
                    {otherUser && (
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${onlineUsers.has(Number(otherUser.id)) ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-base">{otherUser?.name || 'Unknown User'}</h3>
                    <p className="text-xs text-muted-foreground">
                        {otherUser && typingUsers.has(Number(otherUser.id)) ? (
                            <span className="text-blue-600 dark:text-blue-400">typing...</span>
                        ) : otherUser && onlineUsers.has(Number(otherUser.id)) ? (
                            <span className="text-green-600 dark:text-green-400">Active now</span>
                        ) : null}
                    </p>
                </div>
            </div>

            <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 min-h-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                {loading && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message.uid}
                                message={message}
                                currentUser={currentUser}
                                isConsecutive={isConsecutive(index)}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="border-t p-4 shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-3 items-center"
                >
                    <Input
                        ref={inputRef}
                        value={messageText}
                        onChange={handleInputChange}
                        onKeyUp={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 rounded-full px-4 h-11 bg-zinc-100 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 focus-visible:ring-primary"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        disabled={!messageText.trim() || sending}
                        size="icon"
                        className="rounded-full h-11 w-11 shrink-0"
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
