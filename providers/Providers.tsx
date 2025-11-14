"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/contexts/user";
import SocketProvider from "@/contexts/socket";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <UserProvider>
        <SocketProvider>{children}</SocketProvider>
      </UserProvider>
    </SessionProvider>
  );
}

export default Providers;
