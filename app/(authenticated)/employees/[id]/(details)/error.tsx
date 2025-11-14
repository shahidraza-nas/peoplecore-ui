"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function EmployeeDetailsError({
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
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold">Failed to load employee</h2>
                <p className="text-muted-foreground mt-2">
                    There was an error loading the employee details.
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => reset()}>Try again</Button>
                <Link href="/employees">
                    <Button variant="outline">Back to Employees</Button>
                </Link>
            </div>
        </div>
    );
}
