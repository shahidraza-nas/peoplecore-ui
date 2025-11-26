import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with k/M suffix
 * @example kFormatNumber(1000) => "1.0k"
 */
export function kFormatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/**
 * Capitalize first letter of string
 * @example capitalizeFirstLetter("hello") => "Hello"
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format date string with optional time removal
 * @example dateFns("2024-01-01 12:00:00", true) => "01/01/2024"
 */
export function dateFns(dateString: string | Date, removeTime?: boolean): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return format(date, removeTime ? "MM/dd/yyyy" : "MM/dd/yyyy HH:mm:ss");
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
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

/**
 * Check if an error is related to subscription requirements
 */
export function isSubscriptionError(error: any): boolean {
  return (
    error === 'SUBSCRIPTION_REQUIRED' ||
    (typeof error === 'string' && error.toLowerCase().includes('subscription')) ||
    (typeof error === 'object' && error?.error === 'SUBSCRIPTION_REQUIRED') ||
    (typeof error === 'object' && error?.message?.toLowerCase().includes('subscription'))
  );
}

/**
 * Show subscription error toast and redirect to subscription page
 */
export function showSubscriptionError(message: string = 'Active subscription required to access chat features') {
  toast.error(message);
  
  // Redirect to subscription page after a short delay
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/subscription/checkout';
    }
  }, 1500);
}
