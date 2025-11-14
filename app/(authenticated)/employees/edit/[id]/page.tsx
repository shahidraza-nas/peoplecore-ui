import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEmployeeById } from "@/actions/employee.action";
import { notFound } from "next/navigation";
import EditEmployeeForm from "./edit-employee-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: PageProps) {
    const { id } = await params;

    const { success, data, error } = await getEmployeeById(id);

    if (!success || !data) {
        notFound();
    }

    const employee = data.user;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/employees">
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Employees
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Employee</h1>
                    <p className="text-muted-foreground">
                        Update information for {employee.first_name} {employee.last_name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>
                        Modify the employee information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EditEmployeeForm employee={employee} />
                </CardContent>
            </Card>
        </div>
    );
}
