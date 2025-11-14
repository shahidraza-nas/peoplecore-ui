import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  User,
  LoginData,
  RegisterData,
  ApiError,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyOtpData,
  ChangePasswordData,
} from '@/lib/types';
import toast from 'react-hot-toast';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<{ requiresOtp?: boolean; sessionId?: string }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ sessionId: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  verifyOtp: (data: VerifyOtpData) => Promise<{ requiresPassword?: boolean; sessionId?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const storedUser = api.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            await refreshUser();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginData): Promise<{ requiresOtp?: boolean; sessionId?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.login(data);

      if ('otp' in response.data && response.data.otp) {
        toast.success(response.message || 'OTP sent to your email');
        return {
          requiresOtp: true,
          sessionId: response.data.session_id,
        };
      }

      if ('user' in response.data) {
        setUser(response.data.user);
        toast.success(response.message || 'Login successful');
        return {};
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.register(data);
      toast.success(response.message || 'Registration successful. Please login.');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      let errorMessage = 'Registration failed';
      
      if (apiError.statusCode === 401) {
        errorMessage = 'Registration is currently disabled. Please contact an administrator to create your account.';
      } else if (apiError.error && Array.isArray(apiError.error)) {
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
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Logout failed');
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (data: ForgotPasswordData): Promise<{ sessionId: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.forgotPassword(data);
      toast.success(response.message || 'OTP sent to your email');
      return { sessionId: response.data.session_id };
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.resetPassword(data);
      toast.success(response.message || 'Password reset successful');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (data: VerifyOtpData): Promise<{ requiresPassword?: boolean; sessionId?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.verifyOtp(data);
      if ('user' in response.data) {
        setUser(response.data.user);
        toast.success(response.message || 'Login successful');
        return {};
      }
      if ('session_id' in response.data) {
        toast.success(response.message || 'OTP verified');
        return {
          requiresPassword: true,
          sessionId: response.data.session_id,
        };
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.changePassword(data);
      toast.success(response.message || 'Password changed successfully');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!api.isAuthenticated()) return;

    setLoading(true);
    try {
      const response = await api.getMe();
      setUser(response.data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      if (apiError.statusCode === 401 || apiError.statusCode === 403) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyOtp,
    changePassword,
    refreshUser,
    clearError,
  };
}
