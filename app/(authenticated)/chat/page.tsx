"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useSocketContext } from "@/contexts/socket";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/types";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { searchUsers } from "@/actions/user.action";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { socket } = useSocketContext();
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

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
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
                {/* Socket Status Indicator */}
                {/* <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    socket?.connected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                    {socket?.connected ? 'Connected' : 'Disconnected'}
                </div> */}
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
