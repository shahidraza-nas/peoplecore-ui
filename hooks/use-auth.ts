import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { API } from '@/lib/fetch';
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
  const { data: session, status } = useSession();
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  // Type assertion: session.user from NextAuth should match our User type
  // Using unknown as intermediate to handle type mismatch between NextAuth User and our User type
  const user = (session?.user as unknown as User) || null;
  const loading = status === 'loading';

  const login = useCallback(async (data: LoginData): Promise<{ requiresOtp?: boolean; sessionId?: string }> => {
    setError(null);

    try {
      // Use NextAuth signIn with credentials provider
      const result = await signIn('credentials', {
        redirect: false,
        email: data.username, // username field contains email
        password: data.password,
      });

      if (result?.error) {
        // Check if error contains 2FA required with session_id
        if (result.error.startsWith('2FARequired:')) {
          const sessionId = result.error.split(':')[1];
          toast.success('OTP sent to your email');
          return {
            requiresOtp: true,
            sessionId: sessionId,
          };
        }
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Login successful');
        router.push('/dashboard');
        return {};
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Login failed');
      throw err;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setError(null);

    try {
      const response = await API.Post<RegisterData, { user: User }>('auth/register', data);
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
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const { disconnectSocket } = await import('@/contexts/socket');
      disconnectSocket();

      await API.Post('auth/logout', {});
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Logout failed');
      await signOut({ redirect: false });
      router.push('/login');
    }
  }, [router]);

  const forgotPassword = useCallback(async (data: ForgotPasswordData): Promise<{ sessionId: string }> => {
    setError(null);

    try {
      const response = await API.Post<ForgotPasswordData, { session_id: string }>('auth/password/forgot', data);
      toast.success(response.message || 'OTP sent to your email');
      return { sessionId: response.data?.session_id || '' };
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to send OTP');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<void> => {
    setError(null);

    try {
      const response = await API.Post<ResetPasswordData, null>('auth/password/reset', data);
      toast.success(response.message || 'Password reset successful');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Password reset failed');
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (data: VerifyOtpData): Promise<{ requiresPassword?: boolean; sessionId?: string }> => {
    setError(null);

    try {
      const result = await signIn('email-verify', {
        redirect: false,
        session_id: data.session_id,
        otp: data.otp,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Login successful');
        router.push('/dashboard');
        return {};
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'OTP verification failed');
      throw err;
    }
  }, [router]);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    setError(null);

    try {
      const response = await API.Put<ChangePasswordData, null>('user/password', data);
      toast.success(response.message || 'Password changed successfully');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      toast.error(apiError.message || 'Password change failed');
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await API.Me<{ user: User }>();
      router.refresh();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      if (apiError.statusCode === 401 || apiError.statusCode === 403) {
        await signOut({ redirect: false });
        router.push('/login');
      }
    }
  }, [router]);

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
