"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-8xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
                    <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                        Page Not Found
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex gap-3 justify-center pt-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                    <Link href="/">
                        <Button>
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
