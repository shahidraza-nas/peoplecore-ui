"use server";

import { API } from "@/lib/fetch";
import { User } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface EmployeeListResponse {
  users: User[];
  count: number;
}

export interface EmployeeFilter {
  sort?: { field: string; order: string };
  search?: string;
  limit: number;
  offset?: number;
  role?: string;
  active?: boolean;
}

/**
 * List all employees with filters
 */
export async function listEmployees(filter: EmployeeFilter): Promise<{
  success: boolean;
  data?: EmployeeListResponse;
  error?: any;
}> {
  try {
    const { sort, search, limit, offset, role, active } = filter;

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const response = await API.GetAll<any>("user", {
      search: search || undefined,
      limit: limit || 10,
      offset: offset || 0,
      where: Object.keys(where).length > 0 ? where : undefined,
      sort: sort ? [[sort.field, sort.order]] : undefined,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    // API returns: { data: { users: [], count: X } }
    const users = response.data?.users || [];
    const totalCount = response.data?.count || 0;

    return { 
      success: true, 
      data: { 
        users: users, 
        count: totalCount 
      } 
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch employees" };
  }
}

/**
 * Get employee by ID/UID
 */
export async function getEmployeeById(uid: string): Promise<{
  success: boolean;
  data?: { user: User };
  error?: any;
}> {
  try {
    const { data, error } = await API.GetById<{ user: User }>("user", uid);

    if (error) return { success: false, error };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employee:", error);
    return { success: false, error: "Failed to fetch employee" };
  }
}

/**
 * Create new employee
 */
export async function createEmployee(employeeData: Partial<User>): Promise<{
  success: boolean;
  data?: { user: User };
  error?: string;
}> {
  try {
    const { data, error, message, validationErrors } = await API.Create<Partial<User>, { user: User }>(
      "user",
      employeeData
    );

    if (error) {
      // Handle validation errors
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const errorMessage = Object.values(firstError.constraints || {})[0] || "Validation failed";
        return { success: false, error: errorMessage };
      }
      // Handle generic error message
      const errorMessage = typeof error === 'string' ? error : (message || "Failed to create employee");
      return { success: false, error: errorMessage };
    }

    revalidatePath("/employees");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Failed to create employee" };
  }
}

/**
 * Update employee by UID
 */
export async function updateEmployee(
  uid: string,
  employeeData: Partial<User>
): Promise<{
  success: boolean;
  data?: { user: User };
  error?: string;
}> {
  try {
    const { data, error, message, validationErrors } = await API.UpdateById<Partial<User>, { user: User }>(
      "user",
      uid,
      employeeData
    );

    if (error) {
      // Handle validation errors
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const errorMessage = Object.values(firstError.constraints || {})[0] || "Validation failed";
        return { success: false, error: errorMessage };
      }
      // Handle generic error message
      const errorMessage = typeof error === 'string' ? error : (message || "Failed to update employee");
      return { success: false, error: errorMessage };
    }

    revalidatePath("/employees");
    revalidatePath(`/employees/${uid}`);
    revalidatePath(`/employees/edit/${uid}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Failed to update employee" };
  }
}

/**
 * Delete employee by UID
 */
export async function deleteEmployee(uid: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error, message } = await API.DeleteById("user", uid);

    if (error) {
      const errorMessage = typeof error === 'string' ? error : (message || "Failed to delete employee");
      return { success: false, error: errorMessage };
    }

    revalidatePath("/employees");

    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Failed to delete employee" };
  }
}

/**
 * Toggle employee active status by UID
 */
export async function toggleEmployeeStatus(
  uid: string,
  active: boolean
): Promise<{
  success: boolean;
  data?: { user: User };
  error?: string;
}> {
  try {
    const { data, error, message } = await API.UpdateById<Partial<User>, { user: User }>(
      "user",
      uid,
      { active }
    );

    if (error) {
      const errorMessage = typeof error === 'string' ? error : (message || "Failed to toggle employee status");
      return { success: false, error: errorMessage };
    }

    revalidatePath("/employees");
    revalidatePath(`/employees/${uid}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error toggling employee status:", error);
    return { success: false, error: "Failed to toggle employee status" };
  }
}
