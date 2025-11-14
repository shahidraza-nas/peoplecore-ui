import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listEmployees } from "@/actions/employee.action";
import { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import EmployeeFilter from "../(components)/EmployeeFilter";
import EmployeeTableActions from "../(components)/EmployeeTableActions";
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

  const offset = queryPage && !isNaN(queryPage) ? +queryPage - 1 : 0;
  const limit = 10;
  const offsetLimit = offset * limit;

  let sortArr: string[] = [];

  if (sort) {
    const [name, direction] = sort.split(",");
    const populates = name.split(".");
    sortArr = [...populates, direction];
  }

  const { data } = await listEmployees({
    limit,
    offset: offsetLimit,
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

  if (!!data) {
    const { users, count } = data;
    employees = users;
    totalRows = count;
  }

  return (
    <>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-[87vh] mt-3">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-xl font-semibold">Employees</h1>
          <Link href="/employees/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </div>
        <div className="m-4">
          <EmployeeFilter />
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
              {employees.length > 0 &&
                employees.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{offsetLimit + (index + 1)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar || undefined} />
                          <AvatarFallback>
                            {employee.first_name?.[0]}
                            {employee.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {employee.first_name} {employee.last_name}
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
                        <Link href={`/employees/${employee.id}`}>
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
        </div>
      </div>
    </>
  );
}
