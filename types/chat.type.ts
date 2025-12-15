import { User } from './user.type';

export interface Chat {
  id: number;
  uid: string;
  user1Id: number;
  user2Id: number;
  user1?: User;
  user2?: User;
  messages?: ChatMessage[];
  unread_count?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  uid: string;
  chatId: number;
  fromUserId: number;
  toUserId: number;
  message: string;
  isRead: boolean;
  type?: string;
  reaction?: string; // Keep for backward compatibility
  reactions?: Record<string, number[]>;
  fromUser?: User;
  toUser?: User;
  chat?: Chat;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SendMessageData {
  toUserUid: string;
  message: string;
}

export interface TypingData {
  toUserId: number;
  isTyping: boolean;
  chatUid: string;
}
