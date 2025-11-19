import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateNewsfeedForm from "./create-newsfeed-form";
// import CreateNewsfeedForm from "./create-newsfeed-form";

export default function CreateNewsfeedPage() {
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
                    <h1 className="text-3xl font-bold">Add Newsfeed Post</h1>
                    <p className="text-muted-foreground">Create a new newsfeed post</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Newsfeed Details</CardTitle>
                    <CardDescription>
                        Fill in the newsfeed information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateNewsfeedForm />
                </CardContent>
            </Card>
        </div>
    );
}
