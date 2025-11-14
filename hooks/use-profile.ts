import { useState, useCallback, useEffect } from 'react';
import { API } from '@/lib/fetch';
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
  old_password: string;
  password: string;
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.Me<{ user: User }>();
      setUser(response.data?.user || null);
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
      const response = await API.UpdateMe<{ user: User }>(data);
      setUser(response.data?.user || null);
      
      toast.success('Profile updated successfully');
      return response.data?.user || null;
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
      const response = await API.Put<ChangePasswordData, null>('user/password', data);
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
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await API.Patch('user/me/avatar', formData, undefined, { isMultipart: true });
      setUser(response.data?.user || null);
      
      toast.success('Avatar updated successfully');
      return response.data?.user || null;
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
