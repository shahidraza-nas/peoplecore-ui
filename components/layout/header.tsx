"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Users2 } from "lucide-react";

export function Header() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center px-6">
            <div className="w-full max-w-6xl flex items-center justify-between">
                <button 
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 rounded-xl shadow-sm">
                        <Users2 className="w-5 h-5 text-zinc-50 dark:text-zinc-900" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">PeopleCore</h2>
                </button>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center space-x-3 cursor-pointer">
                                <Avatar>
                                    <AvatarImage src="https://ui-avatars.com/api/?name=Shahid+Raza" alt="User" />
                                    <AvatarFallback>SR</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block text-sm font-medium">Shahid Raza</span>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

