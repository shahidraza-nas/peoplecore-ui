"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, MessageSquare, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/contexts/user";
import { useSocketContext } from "@/contexts/socket";
import { markChatAsRead } from "@/lib/api-chat";
import type { Chat, ChatMessage } from "@/lib/types";
import { API } from "@/lib/fetch";

interface UnreadMessageGroup {
    chat: Chat;
    messages: ChatMessage[];
    otherUser: any;
}

export function NotificationDropdown() {
    const router = useRouter();
    const { user, refetchUser } = useUser();
    const { socket } = useSocketContext();
    const [unreadGroups, setUnreadGroups] = useState<UnreadMessageGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUnreadMessages = async () => {
        if (!user || loading) return;

        setLoading(true);
        try {
            // Fetch all chats without where filter to avoid backend error
            const { data } = await API.Get('chat/chats', {
                offset: 0,
                limit: 50,
                populate: ['user1', 'user2']
            });

            const responseData = data as any;
            if (responseData && responseData.chats && Array.isArray(responseData.chats)) {
                const groups: UnreadMessageGroup[] = [];

                // Filter chats with unread messages on client side
                const unreadChats = (responseData.chats as Chat[]).filter(
                    chat => chat.unread_count && chat.unread_count > 0
                );

                for (const chat of unreadChats) {
                    // Fetch only the latest unread message (not all)
                    const messagesResponse = await API.Get(`chat/${chat.uid}/messages`, {
                        offset: 0,
                        limit: 5, // Limit to 5 latest messages instead of all unread
                        populate: ['fromUser']
                    });

                    const messagesData = messagesResponse.data as any;
                    if (messagesData && messagesData.messages &&
                        Array.isArray(messagesData.messages) &&
                        messagesData.messages.length > 0) {
                        const otherUser = chat.user1Id === Number(user.id) ? chat.user2 : chat.user1;
                        
                        // Filter only unread messages
                        const unreadMessages = messagesData.messages.filter((msg: ChatMessage) => !msg.isRead);
                        
                        if (unreadMessages.length > 0) {
                            groups.push({
                                chat,
                                messages: unreadMessages,
                                otherUser
                            });
                        }
                    }
                }

                setUnreadGroups(groups);
            }
        } catch (error) {
            console.error('Failed to fetch unread messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when dropdown opens
    useEffect(() => {
        if (open && user && !loading) {
            fetchUnreadMessages();
        }
        // Cleanup function
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
        };
    }, [open]);

    // Listen for new messages - only refetch user context, not the full list
    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (data: any) => {
            // Only refetch user context to update badge count
            refetchUser();
            // If dropdown is open, debounce the refresh
            if (open && !loading) {
                if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = setTimeout(() => {
                    fetchUnreadMessages();
                }, 1000); // Debounce 1 second
            }
        };
        
        socket.on('message:new', handleNewMessage);
        
        return () => {
            socket.off('message:new', handleNewMessage);
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [socket, open, loading]);

    const handleMarkAsRead = async (chatUid: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await markChatAsRead(chatUid);
            setUnreadGroups(prev => prev.filter(g => g.chat.uid !== chatUid));
            await refetchUser();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-read'));
            }
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    const handleOpenChat = (chatUid: string) => {
        setOpen(false);
        router.push(`/chat?uid=${chatUid}`);
    };

    const handleMarkAllAsRead = async () => {
        try {
            const promises = unreadGroups.map(group => markChatAsRead(group.chat.uid));
            await Promise.all(promises);

            setUnreadGroups([]);
            await refetchUser();

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('chat-read'));
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const totalUnread = user?.unread_messages_count || 0;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {totalUnread !== undefined && totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between p-4 pb-3">
                    <h3 className="font-semibold text-base">Notifications</h3>
                    {unreadGroups.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <Separator />

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                    ) : unreadGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <Bell className="h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">No unread messages</p>
                            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {unreadGroups.map((group) => (
                                <div
                                    key={group.chat.uid}
                                    className="p-3 hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => handleOpenChat(group.chat.uid)}
                                >
                                    <div className="flex gap-3">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarImage
                                                src={group.otherUser?.avatar || undefined}
                                                alt={group.otherUser?.name}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {group.otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
                                                {group.otherUser?.last_name?.[0]?.toUpperCase() || ''}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm font-semibold truncate">
                                                    {group.otherUser?.name || group.otherUser?.first_name || 'Unknown User'}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                    {formatDistanceToNow(new Date(group.messages[0].created_at), {
                                                        addSuffix: true
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground line-clamp-2">
                                                        {group.messages[0].message}
                                                    </p>
                                                    {group.messages.length > 1 && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            +{group.messages.length - 1} more {group.messages.length === 2 ? 'message' : 'messages'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => handleMarkAsRead(group.chat.uid, e)}
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Mark read
                                                </Button>
                                                <span className="flex h-5 px-2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                                                    {group.messages.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {unreadGroups.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-sm"
                                onClick={() => {
                                    setOpen(false);
                                    router.push('/chat');
                                }}
                            >
                                View all messages
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
