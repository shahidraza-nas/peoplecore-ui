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
}: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const hasMarkedAsReadRef = useRef<string | null>(null);

    const otherUser = activeChat && currentUser && activeChat.user1 && activeChat.user2
        ? Number(activeChat.user1.id) === Number(currentUser.id)
            ? activeChat.user2
            : activeChat.user1
        : null;

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    useEffect(() => {
        if (activeChat && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [activeChat]);

    // Reset marked ref when chat changes
    useEffect(() => {
        hasMarkedAsReadRef.current = null;
    }, [activeChat?.uid]);

    // Auto-mark as read when opening chat with unread messages
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        // Only run once per chat
        if (hasMarkedAsReadRef.current === activeChat.uid) return;

        const hasUnread = messages.some(
            (m) => !m.isRead && m.toUserId === currentUser.id
        );

        if (hasUnread) {
            onMarkAsRead(activeChat.uid);
            hasMarkedAsReadRef.current = activeChat.uid;
        }
    }, [activeChat?.uid, currentUser?.id]);

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

            <div className="border-t p-4 flex-shrink-0">
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
                        onKeyPress={handleKeyPress}
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
