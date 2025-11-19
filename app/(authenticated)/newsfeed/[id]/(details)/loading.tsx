import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default function NewsfeedDetailsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" disabled>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Newsfeed
                    </Button>
                    <div>
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-64 mt-2" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            {/* Newsfeed Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-8 w-48" />
                            <div className="flex gap-2 mt-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-6 w-40" />
                                <div className="space-y-3 pl-7">
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-1" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-1" />
                                        <Skeleton className="h-5 w-3/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
