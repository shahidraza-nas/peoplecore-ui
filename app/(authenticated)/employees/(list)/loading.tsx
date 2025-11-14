import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EmployeeFilter from "../(components)/EmployeeFilter";

export default function EmployeesLoading() {
    const data = new Array(10).fill(0);

    return (
        <>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-[87vh] mt-3">
                <div className="flex items-center justify-between px-8 pt-8">
                    <h1 className="text-xl font-semibold">Employees</h1>
                    <Button disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </div>
                <div className="m-4">
                    <EmployeeFilter disabled />
                </div>
                <div className="rounded-xl border bg-card p-8 mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>S.No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((_, index) => (
                                <TableRow key={index}>
                                    {/* S.No */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-8 h-4" />
                                    </TableCell>

                                    {/* Name */}
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="w-32 h-4" />
                                        </div>
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-40 h-4" />
                                    </TableCell>

                                    {/* Phone */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-24 h-4" />
                                    </TableCell>

                                    {/* Role */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-16 h-6 rounded-full" />
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-16 h-6 rounded-full" />
                                    </TableCell>

                                    {/* Joined */}
                                    <TableCell className="font-medium">
                                        <Skeleton className="w-20 h-4" />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-8 h-8 rounded" />
                                            <Skeleton className="w-8 h-8 rounded" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
