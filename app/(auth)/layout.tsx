import { AppHeader } from "@/components/layout/app-header";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
            <AppHeader />
            <div className="flex items-center justify-center px-6 py-12 min-h-[calc(90vh-4rem)]">
                {children}
            </div>
        </div>
    );
}
