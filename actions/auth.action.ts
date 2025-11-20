"use server";

import { signIn, signOut } from "@/auth";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { z } from "zod";

export async function login(
  data: z.infer<typeof LoginSchema>,
  callbackUrl?: string
) {
  const validatedFields = LoginSchema.safeParse(data);
  if (!validatedFields.success) return { error: "Invalid Fields!" };
  
  const { email, password, info } = validatedFields.data as any;
  try {
    const resp = await signIn("credentials", {
      email,
      password,
      redirect: false,
      info: info || { device: "web" }
    });

    if (!resp) {
      throw new Error("Internal server error!");
    }
    const { error } = resp;

    return { data: resp, error };
  } catch (error) {
    // Check if it's an AuthError with a cause
    if (error instanceof AuthError) {
      const cause = (error as any).cause;

      // Check if the cause has an error message
      if (cause?.err?.message) {
        const errorMessage = cause.err.message;

        if (errorMessage.startsWith("2FARequired:")) {
          return {
            error: errorMessage,
            data: null,
          };
        }

        return {
          error: errorMessage,
          data: null,
        };
      }
    }

    // Check if it's a 2FA required error
    if (error instanceof Error && error.message.startsWith("2FARequired:")) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      error: "Invalid email or password. Please try again!",
      data: null,
    };
  }
}

export async function verify2Fa(code: string, sessionId: string) {
  try {
    const resp = await signIn("email-verify", {
      session_id: sessionId,
      otp: code,
      redirect: false,
    });

    if (!resp) {
      throw new Error("Internal server error!");
    }
    const { error } = resp;

    return { data: resp, error };
  } catch (error) {
    // Check if the cause has an error message
    if ((error as any).message) {
      const errorMessage =
        (error as any).message.match(/:(.*?)\$/)?.[1] ||
        "Something went wrong. Please try again.";

      return {
        error: errorMessage,
        data: null,
      };
    }

    return {
      error: "Something went wrong. Please try again.",
      data: null,
    };
  }
}

export async function logOut() {
  await signOut();
}
