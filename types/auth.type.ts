import { User } from './user.type';

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
  avatar?: string;
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
  old_password: string;
  password: string;
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
