import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NewsfeedNotFound() {
    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-6">
                <FileQuestion className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-bold">Newsfeed Not Found</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    The newsfeed post you're looking for doesn't exist or has been deleted.
                </p>
            </div>
            <div className="flex gap-2 mt-4">
                <Link href="/newsfeed">
                    <Button>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Newsfeed
                    </Button>
                </Link>
            </div>
        </div>
    );
}
