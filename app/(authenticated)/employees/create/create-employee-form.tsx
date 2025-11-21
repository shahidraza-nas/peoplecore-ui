"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmployeeForm from "@/components/employees/employee-form";
import { createEmployee } from "@/actions/employee.action";
import { CreateEmployeeData } from "@/types";

export default function CreateEmployeeForm() {
    const router = useRouter();

    const handleSubmit = async (data: CreateEmployeeData | Partial<any>) => {
        const result = await createEmployee(data as CreateEmployeeData);

        if (result.success) {
            toast.success("Employee created successfully");
            router.push("/employees");
        } else {
            toast.error(result.error || "Failed to create employee");
        }
    };

    const handleCancel = () => {
        router.push("/employees");
    };

    return (
        <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
