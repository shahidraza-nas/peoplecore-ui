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
  unread_messages_count?: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  isOnline?: boolean;
}

export interface Employee extends User {
  // Employee-specific fields can be added here
}
