import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listEmployees } from "@/actions/employee.action";
import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import EmployeeFilter from "../(components)/EmployeeFilter";
import EmployeeTableActions from "../(components)/EmployeeTableActions";
import EmployeePagination from "../(components)/EmployeePagination";
import NoData from "@/components/no-data";

interface SearchParams {
  searchParams: Promise<{
    page?: number;
    q?: string;
    sort?: string;
    role?: string;
    active?: string;
  }>;
}

export default async function EmployeesPage({ searchParams }: SearchParams) {
  const { page: queryPage, q, sort, role, active } = await searchParams;

  const currentPage = queryPage && !isNaN(queryPage) ? +queryPage : 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  let sortArr: string[] = [];

  if (sort) {
    const [name, direction] = sort.split(",");
    const populates = name.split(".");
    sortArr = [...populates, direction];
  }

  const result = await listEmployees({
    limit,
    offset,
    sort:
      sortArr.length === 2
        ? { field: sortArr[0], order: sortArr[1] }
        : { field: "created_at", order: "desc" },
    search: q,
    role: role,
    active: active ? active === "true" : undefined,
  });

  let employees: User[] = [];
  let totalRows = 0;

  if (result.success && result.data) {
    employees = result.data.users || [];
    totalRows = result.data.count || 0;
  }

  const totalPages = Math.ceil(totalRows / limit);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your team members and their roles
          </p>
        </div>
        <Link href="/employees/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Filter Section */}
      <EmployeeFilter />

      {/* Table Section */}
      <div className="rounded-xl border bg-card p-6">
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
            {employees.length > 0 &&
              employees.map((employee, index) => (
                <TableRow key={employee.uid}>
                  <TableCell>{offset + (index + 1)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={employee.avatar || undefined}
                          alt={`${employee.first_name || ''} ${employee.last_name || ''}`.trim()}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {(employee.first_name || 'U')?.[0]?.toUpperCase()}
                          {(employee.last_name || '')?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    {employee.phone_code && employee.phone
                      ? `${employee.phone_code} ${employee.phone}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{employee.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.active ? "default" : "destructive"}
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.created_at
                      ? new Date(employee.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/employees/${employee.uid}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <EmployeeTableActions employee={employee} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {(!employees || employees.length === 0) && (
          <NoData
            title="No Employees Found"
            description="No employees match your search criteria"
          />
        )}

        {/* Pagination */}
        {employees.length > 0 && (
          <EmployeePagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
