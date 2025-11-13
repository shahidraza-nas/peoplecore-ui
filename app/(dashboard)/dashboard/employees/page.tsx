import EmployeeTable from "@/components/employees/employee-table";

export default function EmployeesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Manage your team members
                </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
                <EmployeeTable />
            </div>
        </div>
    );
}
