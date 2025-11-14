"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login, verify2Fa } from "@/actions/auth.action";
import { LoginSchema } from "@/schemas";

type LoginFormProps = React.ComponentProps<"div"> & {
  onForgotPassword?: () => void;
};

export function LoginForm({
  className,
  onForgotPassword,
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  const onLogin = async (values: z.infer<typeof LoginSchema>) => {
    try {
      setLoading(true);
      const loadingToast = toast.loading("Logging in...");
      const { error, data } = await login({
        email: values.email,
        password: values.password,
      });
      toast.remove(loadingToast);
      setLoading(false);
      
      if (error) {
        if (error.startsWith("2FARequired:")) {
          const extractedSessionId = error.split(":")[1];
          setSessionId(extractedSessionId);
          setRequiresOtp(true);
          toast.success("OTP sent to your email");
          return;
        } else {
          toast.error(error);
        }
      } else {
        router.push("/dashboard");
        toast.success("Logged in successfully", {
          icon: <CheckCircle className="text-green-500" />,
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || otpCode.length !== 4) return;

    try {
      setLoading(true);
      const loadingToast = toast.loading("Verifying OTP...");
      const { error } = await verify2Fa(otpCode, sessionId);
      toast.remove(loadingToast);
      setLoading(false);

      if (error) {
        toast.error(error);
      } else {
        router.push("/dashboard");
        toast.success("Logged in successfully", {
          icon: <CheckCircle className="text-green-500" />,
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (requiresOtp) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the OTP sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onVerifyOtp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 4}
                    className="w-full cursor-pointer"
                  >
                    Verify OTP
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setRequiresOtp(false);
                      setSessionId("");
                      setOtpCode("");
                    }}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onLogin)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onForgotPassword?.();
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full cursor-pointer"
                >
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
