"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/contexts/user";
import SocketProvider from "@/contexts/socket";
import { NotificationProvider } from "@/contexts/notification";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

/**
 * Unified Providers wrapper
 * Wraps all context providers in the correct order:
 * 1. SessionProvider (auth)
 * 2. SocketProvider (realtime)
 * 3. UserProvider (user data, depends on session)
 * 4. NotificationProvider (notifications, depends on user & socket)
 */
export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SocketProvider>
        <UserProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProvider>
      </SocketProvider>
    </SessionProvider>
  );
}

export default Providers;
