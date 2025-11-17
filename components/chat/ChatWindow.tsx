'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, ChatMessage, User } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
    activeChat: Chat | null;
    messages: ChatMessage[];
    currentUser: User | null;
    loading: boolean;
    sending: boolean;
    typingUsers: Set<number>;
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
    onSendMessage,
    onMarkAsRead,
    onTyping,
}: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

    // Auto-focus input when chat is selected
    useEffect(() => {
        if (activeChat && inputRef.current) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [activeChat]);

    useEffect(() => {
        if (activeChat && messages.length > 0) {
            const hasUnread = messages.some(
                (m) => !m.isRead && m.toUserId === currentUser?.id
            );
            if (hasUnread) {
                onMarkAsRead(activeChat.uid);
            }
        }
    }, [activeChat, messages, currentUser, onMarkAsRead]);

    const handleSend = async () => {
        if (!messageText.trim() || !otherUser || sending) return;

        const text = messageText.trim();
        setMessageText('');

        if (activeChat) {
            onTyping(otherUser.id, false, activeChat.uid);
        }

        await onSendMessage(otherUser.uid, text);
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
            <div className="flex items-center gap-3 border-b bg-background px-6 py-4 flex-shrink-0">
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
                <div className="flex-1">
                    <h3 className="font-semibold text-base">{otherUser?.name || 'Unknown User'}</h3>
                    <p className="text-xs text-muted-foreground">{otherUser?.email}</p>
                </div>
            </div>

            {/* Messages */}
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

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>{otherUser?.name} is typing...</span>
                    </div>
                )}
            </ScrollArea>

            {/* Input - Fixed at bottom */}
            <div className="border-t p-4 flex-shrink-0 bg-background">
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
                        className="flex-1 rounded-full px-4 h-11 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-primary"
                        autoComplete="off"
                    />
                    <Button 
                        type="submit" 
                        disabled={!messageText.trim() || sending} 
                        size="icon"
                        className="rounded-full h-11 w-11 flex-shrink-0"
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
