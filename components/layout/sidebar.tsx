
"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Chat", icon: MessageSquare, path: "/chat" },
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <aside className="w-20 sm:w-64 h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 backdrop-blur-sm flex flex-col">
            {/* Brand Header */}
            <div className="flex items-center justify-center sm:justify-start h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-lg">💬</span>
                <span className="hidden sm:block ml-2 font-bold text-zinc-800 dark:text-zinc-100">
                    PeopleCore
                </span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1 sm:space-y-2 p-2 sm:p-3">
                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        variant="ghost"
                        className={cn(
                            "w-full justify-start text-sm font-medium transition-colors",
                            pathname === item.path
                                ? "bg-zinc-200 dark:bg-zinc-800 border-l-2 border-zinc-800 dark:border-zinc-300"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                        onClick={() => router.push(item.path)}
                    >
                        <item.icon className="w-4 h-4 mr-3" />
                        <span className="hidden sm:inline">{item.name}</span>
                    </Button>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-2 sm:p-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                    variant="outline"
                    className="w-full justify-center sm:justify-start"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </aside>
    );
}














// "use client";

// import { Button } from "@/components/ui/button";
// import { useRouter, usePathname } from "next/navigation";
// import {
//     LayoutDashboard,
//     Users,
//     MessageCircle,
// } from "lucide-react";

// export default function Sidebar() {
//     const router = useRouter();
//     const pathname = usePathname();

//     const links = [
//         { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//         { label: "Employees", href: "/dashboard/employees", icon: Users },
//         { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
//     ];

//     return (
//         <aside className="w-64 border-r bg-white h-screen flex flex-col py-6 shadow-sm">
//             <div className="px-6 mb-8">
//                 <h2 className="text-lg font-semibold text-gray-700">PeopleCore</h2>
//             </div>

//             <nav className="flex-1 space-y-1 px-4">
//                 {links.map((link) => {
//                     const Icon = link.icon;
//                     const isActive = pathname === link.href;

//                     return (
//                         <Button
//                             key={link.href}
//                             variant={isActive ? "secondary" : "ghost"}
//                             className="w-full justify-start gap-2"
//                             onClick={() => router.push(link.href)}
//                         >
//                             <Icon size={18} />
//                             {link.label}
//                         </Button>
//                     );
//                 })}
//             </nav>

//             <div className="mt-auto px-6 text-sm text-muted-foreground">
//                 © {new Date().getFullYear()} PeopleCore
//             </div>
//         </aside>
//     );
// }

