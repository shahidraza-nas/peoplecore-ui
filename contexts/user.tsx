"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { API } from "@/lib/fetch";
import { User as UserModel } from "@/models/user";
import { useSocketContext } from "@/contexts/socket";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  unread_messages_count?: number;
}

interface ApiMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    unread_messages_count?: number;
    [key: string]: any;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { data: session, status } = useSession();
  const { socket } = useSocketContext();
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const { data } = await API.Me<ApiMeResponse>();

      const unreadCount = data?.user?.unread_messages_count ?? 0;
      console.log('[UserContext] ✅ Unread count updated:', unreadCount);
      setUnreadCount(unreadCount);

      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, unread_messages_count: unreadCount };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('unread_count', String(unreadCount));
        localStorage.setItem('unread_count_timestamp', String(Date.now()));
      }
    } catch (err) {
      console.error('[UserContext] Failed to fetch unread count:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initialize user from session
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      setLoading(false);
      setUser(null);
      setUnreadCount(0);
      hasInitializedRef.current = false;
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const mappedUser = {
        id: session.user.id || "",
        name: session.user.full_name || "",
        email: session.user.email || "",
        avatar: session.user.profile_image || undefined,
        unread_messages_count: session.user.unread_messages_count || 0,
      };

      setUser(mappedUser);

      // Only set unread count from session on INITIAL load, not on every session update
      if (!hasInitializedRef.current) {
        const initialCount = session.user.unread_messages_count || 0;
        console.log('[UserContext] 🎯 Initial load, setting count from session:', initialCount);
        setUnreadCount(initialCount);
        hasInitializedRef.current = true;
      } else {
        console.log('[UserContext] ⏭️ Session update, keeping current count');
      }

    } catch (err) {
      console.error('Error initializing user:', err);
      setError("An error occurred while fetching user details");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'unread_count' && e.newValue) {
        setUnreadCount(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return;

    const handleChatRead = () => {
      console.log('[UserContext] 📖 chat-read event received, fetching count...');
      fetchUnreadCount();
    };

    const handleMessageReceived = () => {
      console.log('[UserContext] 📬 message-received event received, fetching count...');
      fetchUnreadCount();
    };

    window.addEventListener('chat-read', handleChatRead);
    window.addEventListener('message-received', handleMessageReceived);

    return () => {
      window.removeEventListener('chat-read', handleChatRead);
      window.removeEventListener('message-received', handleMessageReceived);
    };
  }, [user?.id, fetchUnreadCount]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleMessagesRead = (data: { chatUid: string; readBy: number }) => {
      console.log('[UserContext] 📨 Socket messages.read event received:', data);
      fetchUnreadCount();
    };

    socket.on('messages.read', handleMessagesRead);

    return () => {
      socket.off('messages.read', handleMessagesRead);
    };
  }, [socket, user?.id, fetchUnreadCount]);

  const refreshUnreadCount = useCallback(async () => {
    if (user?.id) {
      await fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  const value: UserContextType = {
    user,
    loading,
    error,
    unreadCount,
    refreshUnreadCount,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
