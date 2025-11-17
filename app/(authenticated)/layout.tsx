"use client";

import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Header />
            <main className="flex-1 overflow-auto" style={{ paddingBottom: '5rem' }}>
                <div className="w-full max-w-6xl mx-auto px-6 py-6">
                    {children}
                </div>
            </main>
            <AppSidebar />
        </div>
    );
}
