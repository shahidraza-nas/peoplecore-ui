"use server";

import { API } from "@/lib/fetch";
import { User, AuthProvider } from "@/lib/types";

export interface UserMeResponse {
  user: User;
}

function normalizeUser(user: any): User {
  return {
    id: user.id,
    uid: user.uid,
    role: user.role,
    provider: user.provider || AuthProvider.Local,
    first_name: user.first_name,
    last_name: user.last_name,
    name: user.full_name || user.name || `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone_code: user.phone_code,
    phone: user.phone,
    avatar: user.profile_image || user.avatar,
    enable_2fa: user.enable_2fa,
    send_email: user.send_email,
    send_sms: user.send_sms,
    send_push: user.send_push,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
    active: user.active,
  };
}

export async function getMe() {
  const { data, error, statusCode } = await API.Me();
  if (error) return { success: false, error, statusCode };

  return { success: true, statusCode, data: data as UserMeResponse };
}

export async function updateMe(
  imageBase64?: string | null,
  profileData?: {
    full_name?: string;
    phone?: string;
    phone_code?: string;
    country_flag_code?: string;
    biodata?: string;
  }
) {
  try {
    const updateData: any = profileData ? { ...profileData } : {};

    const { data, error, statusCode } = await API.UpdateMe(updateData);

    if (error) {
      return {
        success: false,
        error: "Failed to update profile",
        statusCode,
      };
    }

    return {
      success: true,
      data,
      statusCode,
      error: null,
    };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error:
        error?.message || "Something went wrong while updating the profile!",
    };
  }
}

export async function changePassword({
  password,
  old_password,
}: {
  password: string;
  old_password: string;
}) {
  const { data, error, statusCode } = await API.Put("user/password", {
    password,
    old_password,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to change password",
      statusCode,
    };
  }

  return {
    success: true,
    data,
    statusCode,
    error: null,
  };
}

export async function forgotPassword({ email }: { email: string }) {
  const { data, error, statusCode } = await API.Post("auth/password/forgot", {
    email,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to send password reset email",
      statusCode,
    };
  }

  return {
    success: true,
    data,
    statusCode,
    error: null,
  };
}

export async function searchUsers(query: string): Promise<{
  success: boolean;
  data?: { users: User[]; count: number };
  error?: any;
}> {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: { users: [], count: 0 } };
    }

    const response = await API.GetAll<any>("user", {
      search: query,
      limit: 10,
      offset: 0,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    const users = (response.data?.users || []).map((user: any) => normalizeUser(user));
    const count = response.data?.count || 0;

    return {
      success: true,
      data: { users, count },
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search users",
    };
  }
}

export async function getDashboardStats() {
  try {
    const response = await API.DashboardStats<any>();

    if (response.error) {
      return { 
        success: false, 
        error: response.error,
        statusCode: response.statusCode 
      };
    }
    const recentUsers = (response.data?.recentUsers || []).map((user: any) => normalizeUser(user));

    return {
      success: true,
      data: {
        totalUsers: response.data?.totalUsers || 0,
        activeUsers: response.data?.activeUsers || 0,
        adminUsers: response.data?.adminUsers || 0,
        regularUsers: response.data?.regularUsers || 0,
        totalChats: response.data?.totalChats || 0,
        recentUsers,
      },
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
    };
  }
}
