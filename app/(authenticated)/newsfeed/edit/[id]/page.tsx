import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getNewsfeedById } from "@/actions/newsfeed.action";
import { notFound } from "next/navigation";
import EditNewsfeedForm from "./edit-newsfeed-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditNewsfeedPage({ params }: PageProps) {
    const { id } = await params;
    const response = await getNewsfeedById(Number(id));
    if (!response.success || !response.data?.newsfeed) {
        notFound();
    }
    const newsfeed = response.data.newsfeed;
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/newsfeed">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Newsfeed
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Newsfeed Post</h1>
                    <p className="text-muted-foreground">
                        Update information for {newsfeed.title}
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Newsfeed Details</CardTitle>
                    <CardDescription>
                        Modify the newsfeed information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EditNewsfeedForm newsfeed={newsfeed} />
                </CardContent>
            </Card>
        </div>
    );
}
