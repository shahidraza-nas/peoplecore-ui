import { useState, useCallback } from 'react';
import { API } from '@/lib/fetch';
import { User, CreateEmployeeData, ApiError } from '@/types';
import { toast } from 'sonner';

interface UseEmployeesReturn {
  employees: User[];
  loading: boolean;
  error: ApiError | null;
  totalCount: number;
  fetchEmployees: (query?: string) => Promise<void>;
  createEmployee: (data: CreateEmployeeData) => Promise<void>;
  updateEmployee: (uid: string, data: Partial<User>) => Promise<void>;
  deleteEmployee: (uid: string) => Promise<void>;
  getEmployeeById: (uid: string) => Promise<User | null>;
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
      setTotalCount(response.data?.count || 0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to fetch employees');
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

      await fetchEmployees();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
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

  const updateEmployee = useCallback(async (uid: string, data: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.UpdateById<Partial<User>, { user: User }>('user', uid, data);
      toast.success(response.message || 'Employee updated successfully');

      setEmployees(prev => prev.map(emp => emp.uid === uid ? (response.data?.user || emp) : emp));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to update employee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (uid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await API.DeleteById('user', uid);
      toast.success('Employee deleted successfully');
      setEmployees(prev => prev.filter(emp => emp.uid !== uid));
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

  const getEmployeeById = useCallback(async (uid: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await API.GetById<{ user: User }>('user', uid);
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
