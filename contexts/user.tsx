"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Set user from session
      setUser({
        id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
      });
    } catch (err) {
      setError("An error occurred while fetching user details");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Fetch user on initial mount and when session changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetchUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value: UserContextType = {
    user,
    loading,
    error,
    refetchUser,
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
