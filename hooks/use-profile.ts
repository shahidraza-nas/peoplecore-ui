import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, ApiError } from '@/lib/types';
import toast from 'react-hot-toast';

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_code?: string;
  phone?: string;
  enable_2fa?: boolean;
  send_email?: boolean;
  send_sms?: boolean;
  send_push?: boolean;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProfile();
      setUser(response.data.user);
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || 'Failed to fetch profile',
        statusCode: err.response?.status,
        error: err.response?.data?.error,
      };
      setError(apiError);
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.updateProfile(data);
      setUser(response.data.user);
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...response.data.user }));
      }
      
      toast.success('Profile updated successfully');
      return response.data.user;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || 'Failed to update profile',
        statusCode: err.response?.status,
        error: err.response?.data?.error,
      };
      setError(apiError);
      
      if (Array.isArray(apiError.error)) {
        const messages = apiError.error.map((e: any) => 
          typeof e === 'object' && e.constraints 
            ? Object.values(e.constraints).join(', ')
            : String(e)
        );
        toast.error(messages.join('; '));
      } else {
        toast.error(apiError.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.changePassword(data);
      toast.success('Password changed successfully');
      return response;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || 'Failed to change password',
        statusCode: err.response?.status,
        error: err.response?.data?.error,
      };
      setError(apiError);
      
      if (Array.isArray(apiError.error)) {
        const messages = apiError.error.map((e: any) => 
          typeof e === 'object' && e.constraints 
            ? Object.values(e.constraints).join(', ')
            : String(e)
        );
        toast.error(messages.join('; '));
      } else {
        toast.error(apiError.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadAvatar(file);
      setUser(response.data.user);
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...response.data.user }));
      }
      
      toast.success('Avatar updated successfully');
      return response.data.user;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || 'Failed to upload avatar',
        statusCode: err.response?.status,
        error: err.response?.data?.error,
      };
      setError(apiError);
      toast.error(apiError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
  };
}
