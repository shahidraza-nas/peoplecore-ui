"use server";

import { API } from "@/lib/fetch";
import { Chat, ChatMessage, SendMessageData } from "@/types";
import { revalidatePath } from "next/cache";

export interface ChatListResponse {
    chats: Chat[];
    count: number;
    offset: number;
    limit: number;
}

export interface MessageListResponse {
    messages: ChatMessage[];
    count: number;
    offset: number;
    limit: number;
}

export interface ChatFilter {
    limit?: number;
    offset?: number;
}

/**
 * Calculate unread count for each chat
 */
function calculateUnreadCount(chat: Chat, currentUserId: number): number {
    if (!chat.messages || chat.messages.length === 0) return 0;
    return chat.messages.filter(
        (msg) => !msg.isRead && msg.toUserId === currentUserId
    ).length;
}

/**
 * Get all chats for the current user
 */
export async function getMyChats(filter?: ChatFilter): Promise<{
    success: boolean;
    data?: ChatListResponse;
    error?: any;
}> {
    try {
        const query: any = {
            limit: filter?.limit || 50,
            offset: filter?.offset || 0,
        };
        const response = await API.Get("chat", query);
        if (response.error) {
            return { success: false, error: response.error };
        }
        const responseData = response.data as any;
        const chats = responseData?.chats || responseData?.chat || [];
        const count = responseData?.count || 0;
        const offset = responseData?.offset || 0;
        const limit = responseData?.limit || 50;

        return {
            success: true,
            data: { chats, count, offset, limit },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch chats",
        };
    }
}

/**
 * Get messages for a specific chat
 */
export async function getChatMessages(
    chatUid: string,
    filter?: ChatFilter
): Promise<{
    success: boolean;
    data?: MessageListResponse;
    error?: any;
}> {
    try {
        const query: any = {
            limit: filter?.limit || 50,
            offset: filter?.offset || 0,
        };

        const response = await API.Get(`chat/${chatUid}/messages`, query);

        if (response.error) {
            return { success: false, error: response.error };
        }
        const responseData = response.data as any;
        const messages = responseData?.messages || [];
        const count = responseData?.count || 0;
        const offset = responseData?.offset || 0;
        const limit = responseData?.limit || 50;

        return {
            success: true,
            data: { messages, count, offset, limit },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to fetch messages",
        };
    }
}

/**
 * Send a message
 */
export async function sendMessage(data: SendMessageData): Promise<{
    success: boolean;
    data?: { message: ChatMessage };
    error?: any;
}> {
    try {
        const response = await API.Post<SendMessageData, { message: ChatMessage }>(
            "chat/send",
            data
        );

        if (response.error) {
            return { success: false, error: response.error };
        }

        // Revalidate chat pages
        revalidatePath("/chat");

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error sending message:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send message",
        };
    }
}

/**
 * Mark all messages in a chat as read
 */
export async function markChatAsRead(chatUid: string): Promise<{
    success: boolean;
    error?: any;
}> {
    try {
        const response = await API.Get(`chat/${chatUid}/messages/readAll`);
        if (response.error) {
            return { success: false, error: response.error };
        }
        revalidatePath("/chat");
        return { success: true };
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to mark messages as read",
        };
    }
}

/**
 * Get a specific chat by UID
 */
export async function getChatByUid(chatUid: string): Promise<{
    success: boolean;
    data?: { chat: Chat };
    error?: any;
}> {
    try {
        const response = await API.GetById<{ chat: Chat }>("chat", chatUid);
        if (response.error) {
            return { success: false, error: response.error };
        }
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching chat:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch chat",
        };
    }
}

/**
 * Create a new chat with a user
 */
export async function createChat(userUid: string): Promise<{
    success: boolean;
    data?: { chat: Chat };
    error?: any;
}> {
    try {
        const response = await API.Create<{ userUid: string }, { chat: Chat }>(
            "chat",
            { userUid }
        );

        if (response.error) {
            return { 
                success: false, 
                error: response.error || response.statusCode || 'Unknown error'
            };
        }
        
        revalidatePath("/chat");
        return { success: true, data: response.data };
    } catch (error) {
        console.error("❌ createChat action: Exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create chat",
        };
    }
}

/**
 * Delete a chat
 */
export async function deleteChat(chatUid: string): Promise<{
    success: boolean;
    error?: any;
}> {
    try {
        const response = await API.DeleteById("chat", chatUid);
        if (response.error) {
            return { success: false, error: response.error };
        }
        revalidatePath("/chat");
        return { success: true };
    } catch (error) {
        console.error("Error deleting chat:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete chat",
        };
    }
}
