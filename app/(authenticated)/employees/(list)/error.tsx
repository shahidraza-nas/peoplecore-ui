"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground mt-2">
                    Failed to load employees. Please try again.
                </p>
            </div>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
