"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

const mockUsers: Record<string, { name: string; avatar: string; status: string }> = {
    "1": { name: "Alice Johnson", avatar: "https://ui-avatars.com/api/?name=Alice+Johnson", status: "online" },
    "2": { name: "Bob Smith", avatar: "https://ui-avatars.com/api/?name=Bob+Smith", status: "offline" },
    "3": { name: "Carol Davis", avatar: "https://ui-avatars.com/api/?name=Carol+Davis", status: "online" },
    "4": { name: "David Wilson", avatar: "https://ui-avatars.com/api/?name=David+Wilson", status: "offline" },
    "5": { name: "Emma Brown", avatar: "https://ui-avatars.com/api/?name=Emma+Brown", status: "online" },
};

const mockMessages = [
    { id: 1, senderId: "1", text: "Hey! How are you doing?", timestamp: "10:30 AM", isOwn: false },
    { id: 2, senderId: "me", text: "I'm doing great, thanks! How about you?", timestamp: "10:31 AM", isOwn: true },
    { id: 3, senderId: "1", text: "Pretty good! Just working on the new project.", timestamp: "10:32 AM", isOwn: false },
    { id: 4, senderId: "me", text: "That's awesome! Need any help with it?", timestamp: "10:33 AM", isOwn: true },
    { id: 5, senderId: "1", text: "Actually yes, could you review the design?", timestamp: "10:35 AM", isOwn: false },
];

export default function ChatDetailPage() {
    const router = useRouter();
    const params = useParams();
    const chatId = params?.chatId as string;
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(mockMessages);

    const currentUser = mockUsers[chatId] || { name: "Unknown User", avatar: "", status: "offline" };

    const handleSend = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            senderId: "me",
            text: message,
            timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            isOwn: true,
        };

        setMessages([...messages, newMessage]);
        setMessage("");
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/chat")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={currentUser.avatar} />
                                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                            </Avatar>
                            {currentUser.status === "online" && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm">{currentUser.name}</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {currentUser.status === "online" ? "Active now" : "Offline"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Phone className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                        msg.isOwn
                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                    }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${
                                            msg.isOwn
                                                ? "text-zinc-300 dark:text-zinc-600"
                                                : "text-zinc-500 dark:text-zinc-400"
                                        }`}
                                    >
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            className="flex-1"
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
