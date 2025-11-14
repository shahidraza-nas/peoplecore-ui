import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnChat = nextUrl.pathname.startsWith("/chat");
            const isOnProfile = nextUrl.pathname.startsWith("/profile");
            const isOnSettings = nextUrl.pathname.startsWith("/settings");
            const isOnEmployees = nextUrl.pathname.startsWith("/employees");

            if (isOnDashboard || isOnChat || isOnProfile || isOnSettings || isOnEmployees) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return true;
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
