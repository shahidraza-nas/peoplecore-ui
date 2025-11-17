import { API } from './fetch';
import type { Chat, ChatMessage, SendMessageData, ApiResponse } from './types';

const CHAT_ENTITY = 'chat';

/**
 * Get all chats for the current user
 */
export const getMyChats = async (queryParams?: { offset?: number; limit?: number }) => {
    return API.Get(
        `${CHAT_ENTITY}/chats`,
        queryParams
    );
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (
    chatUid: string,
    queryParams?: { offset?: number; limit?: number }
) => {
    return API.Get(
        `${CHAT_ENTITY}/${chatUid}/messages`,
        queryParams
    );
};

/**
 * Send a message
 */
export const sendMessage = async (data: SendMessageData) => {
    return API.Post<SendMessageData, { message: ChatMessage }>(
        `${CHAT_ENTITY}/send`,
        data
    );
};

/**
 * Mark all messages in a chat as read
 */
export const markChatAsRead = async (chatUid: string) => {
    return API.Get(`${CHAT_ENTITY}/${chatUid}/messages/readAll`);
};

/**
 * Get a specific chat by UID
 */
export const getChatByUid = async (chatUid: string) => {
    return API.GetById<{ chat: Chat }>(CHAT_ENTITY, chatUid);
};

/**
 * Create a new chat with a user
 */
export const createChat = async (userUid: string) => {
    return API.Create<{ userUid: string }, { chat: Chat }>(
        CHAT_ENTITY,
        { userUid }
    );
};
