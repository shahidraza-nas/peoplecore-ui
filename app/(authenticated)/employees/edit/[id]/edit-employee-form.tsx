"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmployeeForm from "@/components/employees/employee-form";
import { updateEmployee } from "@/actions/employee.action";
import { User } from "@/types";

interface EditEmployeeFormProps {
  employee: User;
}

export default function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: Partial<User>) => {
    const result = await updateEmployee(employee.uid, data);

    if (result.success) {
      toast.success("Employee updated successfully");
      router.push("/employees");
    } else {
      toast.error(result.error || "Failed to update employee");
    }
  };

  const handleCancel = () => {
    router.push("/employees");
  };

  return (
    <EmployeeForm
      employee={employee}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
