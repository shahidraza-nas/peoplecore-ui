import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateEmployeeForm from "./create-employee-form";

export default function CreateEmployeePage() {
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
                    <h1 className="text-3xl font-bold">Add New Employee</h1>
                    <p className="text-muted-foreground">Create a new employee profile</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>
                        Fill in the employee information below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateEmployeeForm />
                </CardContent>
            </Card>
        </div>
    );
}
