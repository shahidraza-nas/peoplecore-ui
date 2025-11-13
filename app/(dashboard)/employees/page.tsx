"use client";

import { useEffect, useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { User, CreateEmployeeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import EmployeeTable from "@/components/employees/employee-table";
import EmployeeForm from "@/components/employees/employee-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmployeesPage() {
  const { employees, loading, totalCount, fetchEmployees, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = () => {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    fetchEmployees(query);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: User) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your team members and their access
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Employees</CardTitle>
          <CardDescription>
            Find employees by name, email, or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({totalCount})</CardTitle>
          <CardDescription>
            View and manage all registered employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && employees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : (
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Employee Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee 
                ? "Update employee information and permissions" 
                : "Create a new employee account with login credentials"}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={async (data) => {
              if (editingEmployee) {
                await updateEmployee(editingEmployee.id, data as Partial<User>);
              } else {
                await createEmployee(data as CreateEmployeeData);
              }
              setIsFormOpen(false);
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
