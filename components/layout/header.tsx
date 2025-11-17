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
import { Users2, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
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
                            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                                <Avatar>
                                    <AvatarImage 
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.first_name || 'User')}`} 
                                        alt={user?.name || user?.first_name || 'User'} 
                                    />
                                    <AvatarFallback>
                                        {user?.first_name?.[0] || user?.name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block text-sm font-medium">{user?.first_name || user?.name || 'User'}</span>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.first_name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/profile")}>
                                <User className="w-4 h-4 mr-2" />
                                Profile Settings
                            </DropdownMenuItem>
                            {user?.role === 'Admin' && (
                                <DropdownMenuItem onClick={() => router.push("/employees")}>
                                    <Users2 className="w-4 h-4 mr-2" />
                                    Manage Employees
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

