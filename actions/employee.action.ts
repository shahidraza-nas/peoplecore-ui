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

    const query: any = {
      sort: sort ? [[sort.field, sort.order]] : [["created_at", "desc"]],
      search: search || "",
      limit: limit || 10,
      offset: offset || 0,
      data: {},
    };

    if (role) {
      query.data.role = role;
    }

    if (active !== undefined) {
      query.data.active = active;
    }

    const { data, error, count } = await API.GetAll<EmployeeListResponse>("user", query);

    if (error) return { success: false, error };

    return { 
      success: true, 
      data: { 
        users: data?.users || [], 
        count: count || 0 
      } 
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: "Failed to fetch employees" };
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<{
  success: boolean;
  data?: { user: User };
  error?: any;
}> {
  try {
    const { data, error } = await API.GetById<{ user: User }>("user", id);

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
  error?: any;
}> {
  try {
    const { data, error } = await API.Create<Partial<User>, { user: User }>(
      "user",
      employeeData
    );

    if (error) return { success: false, error };

    // Revalidate employees page
    revalidatePath("/employees");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Failed to create employee" };
  }
}

/**
 * Update employee
 */
export async function updateEmployee(
  id: string,
  employeeData: Partial<User>
): Promise<{
  success: boolean;
  data?: { user: User };
  error?: any;
}> {
  try {
    const { data, error } = await API.UpdateById<Partial<User>, { user: User }>(
      "user",
      id,
      employeeData
    );

    if (error) return { success: false, error };

    // Revalidate employees pages
    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Failed to update employee" };
  }
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string): Promise<{
  success: boolean;
  error?: any;
}> {
  try {
    const { error } = await API.DeleteById("user", id);

    if (error) return { success: false, error };

    // Revalidate employees page
    revalidatePath("/employees");

    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Failed to delete employee" };
  }
}

/**
 * Toggle employee active status
 */
export async function toggleEmployeeStatus(
  id: string,
  active: boolean
): Promise<{
  success: boolean;
  data?: { user: User };
  error?: any;
}> {
  try {
    const { data, error} = await API.UpdateById<Partial<User>, { user: User }>(
      "user",
      id,
      { active }
    );

    if (error) return { success: false, error };

    // Revalidate employees pages
    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error toggling employee status:", error);
    return { success: false, error: "Failed to toggle employee status" };
  }
}
