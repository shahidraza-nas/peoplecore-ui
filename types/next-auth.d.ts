import { User as UserMe } from "@/models/user";
import "next-auth";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    full_name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    user: User;
  }
}

declare module "next-auth" {
  export interface Token {
    accessToken: string;
    refreshToken: string;
    tokenExpiry: string;
  }

  export type SessionUserWithToken = Token &
    Pick<
      UserMe,
      | "id"
      | "profile_image"
      | "role"
      | "full_name"
      | "email"
      | "phone"
      | "permissions"
    > & {
      emailVerified: null;
    };

  export type KeyLogin = {
    keyLogin?: boolean;
    admin?: SessionUserWithToken;
  };

  export type SessionUser = SessionUserWithToken & KeyLogin;

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  export interface Session {
    expires: ISODateString;
    user: SessionUser;
    error?: any;
  }

  interface User {
    id: any;
    profile_image?: string;
    role: string;
    full_name: string;
    email: string;
    phone?: string;
    permissions: string[];
    accessToken: string;
    refreshToken: string;
    tokenExpiry: string;
    keyLogin?: boolean;
    admin?: SessionUser;
    emailVerified?: Date | null;
  }
}
