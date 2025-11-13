export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface Chat {
    id: string;
    participant1: User;
    participant2: User;
    lastMessage?: Message;
    unreadCount: number;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface EmployeeFormData {
    name: string;
    email: string;
    phone: string;
    photo?: string;
}