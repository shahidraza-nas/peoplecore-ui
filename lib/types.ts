
export enum Role {
    User = 'User',
    Admin = 'Admin',
}

export enum AuthProvider {
    Local = 'Local',
    Google = 'Google',
    Facebook = 'Facebook',
    Apple = 'Apple',
    Firebase = 'Firebase',
}

export interface User {
    id: number;
    uid: string;
    role: Role;
    provider: AuthProvider;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone_code?: string;
    phone?: string;
    avatar?: string;
    enable_2fa?: boolean;
    send_email?: boolean;
    send_sms?: boolean;
    send_push?: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
    active?: boolean;
}

export interface LoginData {
    username: string;
    password: string;
    info?: Record<string, any>;
}

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_code?: string;
    phone?: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    session_id: string;
    password: string;
}

export interface VerifyOtpData {
    session_id: string;
    otp: string;
}

export interface SendOtpData {
    session_id: string;
}

export interface ChangePasswordData {
    current_password: string;
    new_password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    token_expiry: string;
    refresh_token: string;
}

export interface OtpResponse {
    otp: boolean;
    session_id: string;
}

export interface ApiResponse<T = any> {
    data: T;
    message: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    error?: string | any[];
}

export interface Employee extends User {

}

export interface CreateEmployeeData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_code?: string;
    phone?: string;
    role: Role;
    enable_2fa?: boolean;
    send_email?: boolean;
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