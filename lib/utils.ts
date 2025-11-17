import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSessionProps = (user: any) => {
  return {
    id: user.id,
    uid: user.uid,
    first_name: user.first_name,
    last_name: user.last_name,
    name: user.name,
    full_name: user.name,
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
  };
}
