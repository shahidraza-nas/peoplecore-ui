"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, User, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user";

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Employees", icon: Users, path: "/employees" },
    { name: "Chat", icon: MessageSquare, path: "/chat" },
    { name: "Profile", icon: User, path: "/profile" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-50">
            <div className="flex items-center justify-around h-full px-4 max-w-md mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] relative",
                            pathname === item.path
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        <div className="relative inline-flex">
                            <item.icon className={cn(
                                "w-6 h-6",
                                pathname === item.path && "fill-current"
                            )} />
                            {item.name === "Chat" && user?.unread_messages_count !== undefined && user.unread_messages_count > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white ring-2 ring-white dark:ring-zinc-900">
                                    {user.unread_messages_count > 99 ? '99+' : user.unread_messages_count}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">{item.name}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}

