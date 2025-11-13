"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, ArrowLeft } from "lucide-react";

const mockUsers = [
    { id: "1", name: "Alice Johnson", avatar: "https://ui-avatars.com/api/?name=Alice+Johnson", status: "online", lastMessage: "Hey, how are you?", time: "2m ago" },
    { id: "2", name: "Bob Smith", avatar: "https://ui-avatars.com/api/?name=Bob+Smith", status: "offline", lastMessage: "See you tomorrow!", time: "1h ago" },
    { id: "3", name: "Carol Davis", avatar: "https://ui-avatars.com/api/?name=Carol+Davis", status: "online", lastMessage: "Thanks for the help!", time: "5m ago" },
    { id: "4", name: "David Wilson", avatar: "https://ui-avatars.com/api/?name=David+Wilson", status: "offline", lastMessage: "Let's catch up soon", time: "3h ago" },
    { id: "5", name: "Emma Brown", avatar: "https://ui-avatars.com/api/?name=Emma+Brown", status: "online", lastMessage: "Perfect, thanks!", time: "10m ago" },
];

export default function ChatPage() {
    const router = useRouter();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Start a conversation with your team members
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Recent Conversations
                        </CardTitle>
                        <CardDescription>Select a contact to start chatting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {mockUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => router.push(`/chat/${user.id}`)}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                            >
                                <div className="relative">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    {user.status === "online" && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">{user.name}</h3>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{user.time}</span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{user.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
