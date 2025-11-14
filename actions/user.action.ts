"use server";

import { API } from "@/lib/fetch";
import { User } from "@/models/user";

export interface UserMeResponse {
  user: User;
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
    let updateData: Partial<User> = {};

    if (profileData) {
      updateData = {
        ...profileData,
        name: profileData.full_name,
      };
    }

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
