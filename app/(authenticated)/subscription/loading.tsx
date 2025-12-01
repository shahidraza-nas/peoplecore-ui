import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function SubscriptionLoading() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto py-8">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Premium Status Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-8 md:p-10 text-white">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
                <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-16 w-16 rounded-2xl bg-white/20" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48 bg-white/20" />
                                <Skeleton className="h-4 w-64 bg-white/20" />
                            </div>
                        </div>
                        <div className="text-right hidden md:block space-y-2">
                            <Skeleton className="h-4 w-20 bg-white/20 ml-auto" />
                            <Skeleton className="h-10 w-28 bg-white/20 ml-auto" />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-40 bg-white/20" />
                            <Skeleton className="h-4 w-12 bg-white/20" />
                        </div>
                        <Skeleton className="h-3 w-full rounded-full bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <Skeleton className="h-5 w-28" />
                            </div>
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-3 w-20 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Features & Actions Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Features Card */}
                <Card className="border-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <Skeleton className="h-4 w-56 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Actions Card */}
                <Card className="border-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-44" />
                        </div>
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card className="border-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <Skeleton className="h-6 w-20 ml-auto" />
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
