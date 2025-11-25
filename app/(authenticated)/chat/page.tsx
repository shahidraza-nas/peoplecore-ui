"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useSubscription } from "@/hooks/use-subscription";
import { useSocketContext } from "@/contexts/socket";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { searchUsers } from "@/actions/user.action";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { socket } = useSocketContext();
    const { hasAccess, loading: subscriptionLoading, subscription, isInGracePeriod } = useSubscription();
    const [isInitializingChat, setIsInitializingChat] = useState(false);
    const {
        chats,
        activeChat,
        messages,
        loading,
        sending,
        typingUsers,
        onlineUsers,
        setActiveChat,
        sendMessage,
        markAsRead,
        setTyping,
        createNewChat,
        refreshChats,
    } = useChat(user);

    // Listen for chat-read events from notifications
    useEffect(() => {
        const handleChatRead = () => {
            refreshChats();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('chat-read', handleChatRead);
            return () => window.removeEventListener('chat-read', handleChatRead);
        }
    }, [refreshChats]);

    // Debug socket status
    useEffect(() => {
        console.log("=== CHAT PAGE DEBUG ===");
        console.log("User:", user?.email);
        console.log("Socket exists:", !!socket);
        console.log("Socket connected:", socket?.connected);
        console.log("Socket ID:", socket?.id);
        console.log("Active chat:", activeChat?.uid);
        console.log("Messages count:", messages.length);
        console.log("=======================");
    }, [socket, user, activeChat, messages.length]);

    useEffect(() => {
        const userUid = searchParams.get('user');
        if (userUid && !isInitializingChat && chats.length > 0) {
            setIsInitializingChat(true);
            const existingChat = chats.find(chat => {
                const otherUser = Number(chat.user1?.id) === Number(user?.id) ? chat.user2 : chat.user1;
                return otherUser?.uid === userUid;
            });

            if (existingChat) {
                setActiveChat(existingChat);
                router.replace('/chat', { scroll: false });
            } else {
                searchUsers('').then(result => {
                    if (result.success && result.data?.users) {
                        const targetUser = result.data.users.find(u => u.uid === userUid);
                        if (targetUser) {
                            handleStartNewChat(targetUser);
                        }
                    }
                    router.replace('/chat', { scroll: false });
                });
            }
        }
    }, [searchParams, chats, user, isInitializingChat]);

    const handleSendMessage = async (toUserUid: string, message: string) => {
        await sendMessage(toUserUid, message);
    };

    const handleSetTyping = (toUserId: number, isTyping: boolean, chatUid: string) => {
        setTyping(toUserId, isTyping, chatUid);
    };

    const handleStartNewChat = async (selectedUser: User) => {
        try {
            const existingChat = chats.find(chat => {
                const otherUser = Number(chat.user1?.id) === Number(user?.id) ? chat.user2 : chat.user1;
                return otherUser?.uid === selectedUser.uid;
            });

            if (existingChat) {
                setActiveChat(existingChat);
                toast.success(`Opened chat with ${selectedUser.name}`);
                return;
            }
            const chat = await createNewChat(selectedUser.uid);
            if (chat) {
                await refreshChats();
                setActiveChat(chat);
                toast.success(`Started chat with ${selectedUser.name}`);
            }
        } catch (error) {
            console.error('Error starting new chat:', error);
            toast.error('Failed to start chat');
        }
    };

    // Check subscription access (skip for admins)
    if (user?.role !== 'Admin') {
        if (subscriptionLoading) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
            );
        }

        if (!hasAccess) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Card className="w-full max-w-md">
                        <div className="p-8 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Subscription Required</h2>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    You need an active subscription to access chat features.
                                </p>
                            </div>
                            <div className="pt-4 space-y-3">
                                <Button onClick={() => router.push('/subscription/checkout')} size="lg" className="w-full">
                                    Subscribe Now
                                </Button>
                                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
            {/* Grace Period Warning Banner */}
            {isInGracePeriod && user?.role !== 'Admin' && (
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-orange-900 dark:text-orange-100">Grace Period Active</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                Your subscription has expired but you still have access for a limited time. Renew now to avoid interruption.
                            </p>
                        </div>
                        <Button onClick={() => router.push('/subscription/checkout')} size="sm" variant="outline" className="border-orange-300 dark:border-orange-700">
                            Renew
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                        Chat with your team members
                    </p>
                </div>
            </div>

            {/* Chat Interface */}
            <Card className="overflow-hidden flex-1 flex flex-col min-h-0 mb-2">
                <div className="flex flex-1 min-h-0">
                    {/* Chat List - Left Sidebar */}
                    <div className="w-80 border-r">
                        <ChatList
                            chats={chats}
                            activeChat={activeChat}
                            currentUser={user}
                            loading={loading}
                            onlineUsers={onlineUsers}
                            onSelectChat={setActiveChat}
                            onStartNewChat={handleStartNewChat}
                        />
                    </div>

                    {/* Chat Window - Main Area */}
                    <div className="flex-1">
                        <ChatWindow
                            activeChat={activeChat}
                            messages={messages}
                            currentUser={user}
                            loading={loading}
                            sending={sending}
                            typingUsers={typingUsers}
                            onlineUsers={onlineUsers}
                            onSendMessage={handleSendMessage}
                            onMarkAsRead={markAsRead}
                            onTyping={handleSetTyping}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
