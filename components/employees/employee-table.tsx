"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Plus } from "lucide-react";
import { Employee } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const dummyEmployees: Employee[] = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 555 234 567",
        photo: "https://ui-avatars.com/api/?name=John+Doe",
        userId: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 555 987 654",
        photo: "https://ui-avatars.com/api/?name=Jane+Smith",
        userId: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        name: "Robert Brown",
        email: "robert.brown@example.com",
        phone: "+1 555 876 321",
        photo: "https://ui-avatars.com/api/?name=Robert+Brown",
        userId: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export default function EmployeeTable() {
    const [employees, setEmployees] = useState<Employee[]>(dummyEmployees);
    const [isOpen, setIsOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        photo: "",
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            setEmployees((prev) => prev.filter((e) => e.id !== id));
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            photo: employee.photo || "",
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingEmployee) {
            // Update existing employee
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === editingEmployee.id
                        ? { ...emp, ...formData, updatedAt: new Date().toISOString() }
                        : emp
                )
            );
        } else {
            // Create new employee
            const newEmployee: Employee = {
                id: Date.now().toString(),
                ...formData,
                userId: "user1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setEmployees((prev) => [...prev, newEmployee]);
        }
        
        handleClose();
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingEmployee(null);
        setFormData({ name: "", email: "", phone: "", photo: "" });
    };

    return (
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Employees</CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingEmployee(null); setFormData({ name: "", email: "", phone: "", photo: "" }); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="photo">Photo URL (optional)</Label>
                                <Input
                                    id="photo"
                                    value={formData.photo}
                                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingEmployee ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-4">

                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={emp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}`} />
                                            <AvatarFallback>{emp.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{emp.name}</TableCell>
                                    <TableCell>{emp.email}</TableCell>
                                    <TableCell>{emp.phone}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(emp)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(emp.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {employees.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-zinc-500 py-6">
                                        No employees found. Click "Add Employee" to create one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
