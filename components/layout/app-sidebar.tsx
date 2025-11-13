"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, User, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Chat", icon: MessageSquare, path: "/chat" },
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-50">
            <div className="flex items-center justify-around h-full px-4 max-w-md mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                            pathname === item.path
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        <item.icon className={cn(
                            "w-6 h-6",
                            pathname === item.path && "fill-current"
                        )} />
                        <span className="text-xs font-medium">{item.name}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
