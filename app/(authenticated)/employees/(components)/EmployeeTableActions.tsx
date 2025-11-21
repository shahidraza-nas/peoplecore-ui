"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SquarePenIcon, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { User } from "@/types";
import { deleteEmployee, toggleEmployeeStatus } from "@/actions/employee.action";
import { toast } from "sonner";

interface EmployeeTableActionsProps {
  employee: User;
}

export default function EmployeeTableActions({
  employee,
}: EmployeeTableActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const handleEdit = () => {
    router.push(`/employees/edit/${employee.uid}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { success, error } = await deleteEmployee(employee.uid);

      if (success) {
        toast.success("Employee deleted successfully");
        setShowDeleteDialog(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(error || "Failed to delete employee");
      }
    } catch (error) {
      toast.error("An error occurred while deleting employee");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const { success, error } = await toggleEmployeeStatus(
        employee.uid,
        !employee.active
      );

      if (success) {
        toast.success(
          `Employee ${!employee.active ? "activated" : "deactivated"} successfully`
        );
        setShowToggleDialog(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(error || "Failed to update employee status");
      }
    } catch (error) {
      toast.error("An error occurred while updating employee status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <SquarePenIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowToggleDialog(true)}
            className="cursor-pointer"
          >
            {employee.active ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {employee.first_name} {employee.last_name}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {employee.active ? "Deactivate" : "Activate"} Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {employee.active ? "deactivate" : "activate"}{" "}
              <strong>
                {employee.first_name} {employee.last_name}
              </strong>
              ?
              {employee.active && " This will prevent them from accessing the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={isToggling}>
              {isToggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employee.active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
