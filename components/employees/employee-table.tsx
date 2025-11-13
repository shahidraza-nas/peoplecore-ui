"use client";

import { User } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Shield, ShieldCheck } from "lucide-react";

function formatDistanceToNow(date: Date, options?: any): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface EmployeeTableProps {
  employees: User[];
  onEdit: (employee: User) => void;
  onDelete: (id: number) => void;
}

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No employees found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>
                      {employee.first_name[0]}{employee.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-zinc-500">{employee.provider}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">{employee.email}</p>
                  {employee.phone && (
                    <p className="text-xs text-zinc-500">
                      {employee.phone_code} {employee.phone}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={employee.role === 'Admin' ? 'default' : 'secondary'} className="gap-1">
                  {employee.role === 'Admin' ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <Shield className="h-3 w-3" />
                  )}
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="default">
                  Active
                </Badge>
              </TableCell>
              <TableCell>
                {employee.last_login_at ? (
                  <span className="text-sm text-zinc-500">
                    {formatDistanceToNow(new Date(employee.last_login_at), { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-400">Never</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(employee.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
