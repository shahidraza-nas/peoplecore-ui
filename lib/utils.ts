import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSessionProps = (user: any) => {
  return {
    id: user.id,
    profile_image: user.profile_image,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    emailVerified: null,
    permissions: user.permissions,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    tokenExpiry: user.tokenExpiry,
    keyLogin: user.keyLogin,
    admin: user.admin,
  };
}
