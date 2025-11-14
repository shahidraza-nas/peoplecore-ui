import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Calendar, Shield, Edit } from "lucide-react";
import Link from "next/link";
import { getEmployeeById } from "@/actions/employee.action";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
    const { id } = await params;

    const { success, data } = await getEmployeeById(id);

    if (!success || !data) {
        notFound();
    }

    const employee = data.user;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/employees">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Employees
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Employee Details</h1>
                        <p className="text-muted-foreground">
                            View employee information and activity
                        </p>
                    </div>
                </div>
                <Link href={`/employees/edit/${id}`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Employee
                    </Button>
                </Link>
            </div>

            {/* Employee Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={employee.avatar || undefined} />
                            <AvatarFallback className="text-2xl">
                                {employee.first_name?.[0]}
                                {employee.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">
                                {employee.first_name} {employee.last_name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{employee.role}</Badge>
                                <Badge variant={employee.active ? "default" : "destructive"}>
                                    {employee.active ? "Active" : "Inactive"}
                                </Badge>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Contact Information
                            </h3>
                            <div className="space-y-3 pl-7">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{employee.email}</p>
                                </div>
                                {employee.phone && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">
                                            {employee.phone_code} {employee.phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Account Information
                            </h3>
                            <div className="space-y-3 pl-7">
                                <div>
                                    <p className="text-sm text-muted-foreground">User ID</p>
                                    <p className="font-medium font-mono">{employee.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium">{employee.role}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Provider</p>
                                    <p className="font-medium">{employee.provider || "Local"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Date Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Date Information
                            </h3>
                            <div className="space-y-3 pl-7">
                                <div>
                                    <p className="text-sm text-muted-foreground">Joined</p>
                                    <p className="font-medium">
                                        {employee.created_at
                                            ? new Date(employee.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                                {employee.last_login_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Login</p>
                                        <p className="font-medium">
                                            {new Date(employee.last_login_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Preferences</h3>
                            <div className="space-y-3 pl-7">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">2FA Enabled</p>
                                    <Badge variant={employee.enable_2fa ? "default" : "secondary"}>
                                        {employee.enable_2fa ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">Email Notifications</p>
                                    <Badge variant={employee.send_email ? "default" : "secondary"}>
                                        {employee.send_email ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">SMS Notifications</p>
                                    <Badge variant={employee.send_sms ? "default" : "secondary"}>
                                        {employee.send_sms ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
