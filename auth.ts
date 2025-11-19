import NextAuth, { CredentialsSignin, SessionUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { API } from "./lib/fetch";
import { getSessionProps } from "./lib/utils";
import { LoginSchema } from "./schemas";

class InvalidCredentialError extends CredentialsSignin {
  code = "credential_error";
}

class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}

class InvalidOtpError extends CredentialsSignin {
  code = "otp_error";
}

interface LoginResponseUserData {
  user: SessionUser;
  token: string;
  refresh_token: string;
  token_expiry: string;
}

interface LoginResponseOtpData {
  otp: boolean;
  session_id: string;
}

interface RefreshTokenBody {
  token: string;
  refresh_token: string;
}

interface EmailVerifyBody {
  session_id?: unknown;
  otp?: unknown;
  info?: { [key: string]: unknown };
}

type LoginResponseData = LoginResponseUserData & LoginResponseOtpData;

type RefreshTokenResData = LoginResponseUserData;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    Credentials({
      name: "Sign In",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password } = await LoginSchema.parseAsync(credentials);

        const { data, error, message } = await API.Login<LoginResponseData>({
          username: email,
          password,
          info: { device: "web" },
        });

        if (!!error) {
          throw new InvalidCredentialError(message);
        }

        if (data?.otp) {
          throw new Error("2FARequired:" + data.session_id);
        }

        if (!!error || !data) {
          if (message === "Account is inactive")
            throw new AccountInactiveError(message);
          else throw new InvalidCredentialError(message);
        }
        const userWithTokens = {
          ...data.user,
          accessToken: data.token,
          refreshToken: data.refresh_token,
          tokenExpiry: data.token_expiry,
        };
        return getSessionProps(userWithTokens) as any;
      },
    }),
    Credentials({
      id: "email-verify",
      name: "Email Verify",
      credentials: {
        session_id: {
          label: "Session ID",
          type: "text",
          placeholder: "Session ID",
        },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const { data, error, message } = await API.Post<
          EmailVerifyBody,
          LoginResponseData
        >(
          "auth/otp/verify",
          {
            ...credentials,
            info: {},
          },
          {},
          { secured: false }
        );

        if (!!error) {
          throw new InvalidOtpError(`:${message}$`);
        }
        const userWithTokens = {
          ...data!.user,
          accessToken: data!.token,
          refreshToken: data!.refresh_token,
          tokenExpiry: data!.token_expiry,
        };

        return getSessionProps(userWithTokens) as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = ["/dashboard", "/chat", "/profile", "/settings", "/employees"].some(
        path => nextUrl.pathname.startsWith(path)
      );

      if (isOnProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async session({ session, token }) {
      if (token && token.user) {
        const sessionUser = getSessionProps(token.user as SessionUser);
        session.user = sessionUser as any;
        session.error = token.error;
        
        if (token.error === "RefreshAccessTokenError") {
          return { ...session, error: "RefreshAccessTokenError" };
        }
      }
      return session;
    },
    async jwt(params) {
      const { token, user, account, session, trigger } = params;

      if (trigger === "update") {
        if (session.accessToken) {
          return {
            ...token,
            user: getSessionProps(session),
          };
        } else {
          return {
            ...token,
            user: getSessionProps({
              ...(token.user as SessionUser),
              ...session.user,
            }),
          };
        }
      }

      if (account && user) {
        return {
          ...token,
          user: getSessionProps(user as SessionUser),
        };
      }

      // If no user in token yet, return token as is
      if (!token.user) {
        return token;
      }

      // Check the token validity
      const tokenUser = token.user as SessionUser;
      if (tokenUser?.tokenExpiry && new Date() < new Date(tokenUser.tokenExpiry)) {
        return token;
      }

      // Get new token using refresh token
      return refreshAccessToken(token);
    },
  },
  debug: process.env.NEXT_AUTH_DEBUG === "Y",
});

const refreshAccessToken = async (token: JWT) => {
  try {
    const tokenUser = token.user as SessionUser;
    
    if (!tokenUser?.accessToken || !tokenUser?.refreshToken) {
      throw new Error("No tokens available");
    }

    const { data, error } = await API.Post<
      RefreshTokenBody,
      RefreshTokenResData
    >(
      "auth/token",
      {
        token: tokenUser.accessToken,
        refresh_token: tokenUser.refreshToken,
      },
      undefined,
      { secured: false }
    );
    if (error || !data) {
      throw new Error("Something went wrong!");
    }
    return {
      ...token,
      user: {
        ...getSessionProps(tokenUser),
        accessToken: data.token,
        tokenExpiry: data.token_expiry,
      },
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};
