"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, UserPlus, TrendingUp, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const stats = [
    { label: "Total Users", value: "128", change: "+12 since last week", icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Active Now", value: "34", change: "Online", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
    { label: "Messages", value: "89", change: "+7 today", icon: MessageSquare, color: "text-purple-600 dark:text-purple-400" },
    { label: "Employees", value: "45", change: "Registered", icon: UserPlus, color: "text-orange-600 dark:text-orange-400" },
];

const recentActivity = [
    { user: "Alice Johnson", action: "Started a conversation", time: "2 min ago", avatar: "https://ui-avatars.com/api/?name=Alice+Johnson" },
    { user: "Bob Smith", action: "Updated profile", time: "15 min ago", avatar: "https://ui-avatars.com/api/?name=Bob+Smith" },
    { user: "Carol Davis", action: "Added new employee", time: "1 hour ago", avatar: "https://ui-avatars.com/api/?name=Carol+Davis" },
    { user: "David Wilson", action: "Sent a message", time: "2 hours ago", avatar: "https://ui-avatars.com/api/?name=David+Wilson" },
];

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, { }</h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Here's what's happening with your team today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {stat.label}
                            </CardTitle>
                            <div className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-2"
                            onClick={() => router.push("/chat")}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm">Start Chat</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-2"
                            onClick={() => router.push("/dashboard/employees")}
                        >
                            <UserPlus className="w-5 h-5" />
                            <span className="text-sm">Add Employee</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-2"
                            onClick={() => router.push("/profile")}
                        >
                            <Users className="w-5 h-5" />
                            <span className="text-sm">View Profile</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-2"
                            onClick={() => router.push("/settings")}
                        >
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm">Analytics</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <Avatar>
                                    <AvatarImage src={activity.avatar} />
                                    <AvatarFallback>{activity.user[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{activity.user}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{activity.action}</p>
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
