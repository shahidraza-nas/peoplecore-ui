import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSessionProps = (user: any) => {
  const fullName = user.full_name || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const nameParts = fullName.split(' ').filter(Boolean);
  const firstName = user.first_name || nameParts[0] || '';
  const lastName = user.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
  
  return {
    id: user.id,
    uid: user.uid,
    first_name: firstName,
    last_name: lastName,
    name: fullName,
    full_name: fullName,
    profile_image: user.profile_image,
    avatar: user.avatar || user.profile_image,
    role: user.role,
    email: user.email,
    phone: user.phone,
    phone_code: user.phone_code,
    emailVerified: null,
    permissions: user.permissions,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    tokenExpiry: user.tokenExpiry,
    keyLogin: user.keyLogin,
    admin: user.admin,
    active: user.active,
    enable_2fa: user.enable_2fa,
    provider: user.provider,
    unread_messages_count: user.unread_messages_count || 0,
  };
}
