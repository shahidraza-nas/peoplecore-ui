"use client";

import { Users2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
    return (
        <header className="w-full py-6 px-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 rounded-xl shadow-sm">
                        <Users2 className="w-6 h-6 text-zinc-50 dark:text-zinc-900" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                        PeopleCore
                    </span>
                </Link>
                <ThemeToggle />
            </div>
        </header>
    );
}
