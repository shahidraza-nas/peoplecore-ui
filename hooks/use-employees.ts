import { useState, useCallback } from 'react';
import { API } from '@/lib/fetch';
import { User, CreateEmployeeData, ApiError } from '@/lib/types';
import toast from 'react-hot-toast';

interface UseEmployeesReturn {
  employees: User[];
  loading: boolean;
  error: ApiError | null;
  totalCount: number;
  fetchEmployees: (query?: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<void>;
  updateEmployee: (id: number, data: Partial<User>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  getEmployeeById: (id: number) => Promise<User | null>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEmployees = useCallback(async (query: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.GetAll<{ users: User[]; count: number }>('user');
      setEmployees(response.data?.users || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to fetch employees');
      // Set empty array on error to prevent undefined issues
      setEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(async (data: CreateEmployeeData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.Create<CreateEmployeeData, { user: User }>('user', data);
      toast.success(response.message || 'Employee created successfully');
      
      // Refresh the list
      await fetchEmployees();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      // Extract readable error message from validation errors
      let errorMessage = 'Failed to create employee';
      
      if (apiError.error && Array.isArray(apiError.error)) {
        const firstError = apiError.error[0];
        if (firstError && typeof firstError === 'object' && 'constraints' in firstError) {
          const constraints = firstError.constraints as Record<string, string>;
          errorMessage = Object.values(constraints)[0] || errorMessage;
        }
      } else if (apiError.message && typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      }
      
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id: number, data: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.UpdateById<Partial<User>, { user: User }>('user', id, data);
      toast.success(response.message || 'Employee updated successfully');
      
      // Update local state
      setEmployees(prev => prev.map(emp => emp.id === id ? (response.data?.user || emp) : emp));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to update employee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await API.DeleteById('user', id);
      toast.success('Employee deleted successfully');
      
      // Remove from local state
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to delete employee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeeById = useCallback(async (id: number): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.GetById<{ user: User }>('user', id);
      return response.data?.user || null;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to fetch employee');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    loading,
    error,
    totalCount,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
  };
}
