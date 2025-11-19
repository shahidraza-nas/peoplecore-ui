import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pin, Edit } from "lucide-react";
import Link from "next/link";
import { getNewsfeedById } from "@/actions/newsfeed.action";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NewsfeedDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const response = await getNewsfeedById(Number(id));
    if (!response.success || !response.data?.newsfeed) {
        notFound();
    }
    const newsfeed = response.data.newsfeed;
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/newsfeed">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Newsfeed
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Newsfeed Details</h1>
                        <p className="text-muted-foreground">View newsfeed post and activity</p>
                    </div>
                </div>
                <Link href={`/newsfeed/edit/${id}`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Newsfeed
                    </Button>
                </Link>
            </div>
            {/* Newsfeed Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {newsfeed.pinned && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Pin size={16} /> Pinned
                            </Badge>
                        )}
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{newsfeed.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant={newsfeed.published ? "default" : "secondary"}>
                                    {newsfeed.published ? "Published" : "Draft"}
                                </Badge>
                                <Badge variant="secondary">{newsfeed.authorId ? `By User #${newsfeed.authorId}` : "Unknown Author"}</Badge>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Content */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Content</h3>
                            <div className="space-y-3 pl-7">
                                <div>
                                    <p className="text-sm text-muted-foreground">Text</p>
                                    <p className="font-medium">{newsfeed.content}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {typeof newsfeed.tags === 'string'
                                            ? newsfeed.tags.split(',').map((tag: string) => (
                                                <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
                                            ))
                                            : Array.isArray(newsfeed.tags)
                                                ? (newsfeed.tags as string[]).map((tag: string) => (
                                                    <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
                                                ))
                                                : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Date Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Date Information</h3>
                            <div className="space-y-3 pl-7">
                                <div>
                                    <p className="text-sm text-muted-foreground">Published Date</p>
                                    <p className="font-medium">
                                        {newsfeed.publishDate
                                            ? new Date(newsfeed.publishDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {newsfeed.publishDate
                                            ? new Date(newsfeed.publishDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
