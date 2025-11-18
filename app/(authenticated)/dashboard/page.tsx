"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, UserPlus, TrendingUp, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/user.action";
import { DashboardStats } from "@/lib/types";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const response = await getDashboardStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                toast.error("Failed to load dashboard statistics");
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Employees", value: loading ? "..." : (stats?.totalUsers || 0).toString(), change: "Registered", icon: Users, color: "text-blue-600 dark:text-blue-400" },
        { label: "Active Now", value: loading ? "..." : (stats?.activeUsers || 0).toString(), change: "Online recently", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
        { label: "Admins", value: loading ? "..." : (stats?.adminUsers || 0).toString(), change: "Admin users", icon: UserPlus, color: "text-purple-600 dark:text-purple-400" },
        { label: "Regular Users", value: loading ? "..." : (stats?.regularUsers || 0).toString(), change: "Standard access", icon: MessageSquare, color: "text-orange-600 dark:text-orange-400" },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.first_name || 'User'}</h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Here's what's happening with your team today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
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
                            onClick={() => router.push("/employees")}
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
                            onClick={() => router.push("/chat")}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm">Team Chat</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Employees */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Employees</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/employees")}>
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                        </div>
                    ) : !stats?.recentUsers || stats.recentUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-zinc-500">No employees found</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => router.push("/employees")}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add First Employee
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentUsers.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <Avatar>
                                        <AvatarImage src={employee.avatar || undefined} />
                                        <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push("/employees")}>
                                        <p className="text-sm font-medium">{employee.name}</p>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{employee.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={employee.role === 'Admin' ? 'default' : 'secondary'}>
                                            {employee.role}
                                        </Badge>
                                        {employee.last_login_at && (
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                                Active
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/chat?user=${employee.uid}`);
                                            }}
                                            title={`Chat with ${employee.name}`}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
