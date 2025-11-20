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
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login, verify2Fa } from "@/actions/auth.action";
import { LoginSchema } from "@/schemas";
import { useNotificationContext } from "@/contexts/notification";

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
  const { fcmToken } = useNotificationContext();

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
        info: { device: "web", fcm: fcmToken },
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
        toast.success("Logged in successfully", {
          icon: <CheckCircle className="text-green-500" />,
        });
        window.location.href = "/dashboard";
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
        toast.success("Logged in successfully", {
          icon: <CheckCircle className="text-green-500" />,
        });
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (requiresOtp) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-base">
              Enter the 4-digit code sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onVerifyOtp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="0000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    disabled={isLoading}
                    className="h-11 text-center text-lg tracking-widest font-semibold transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 4}
                    className="w-full h-11 font-semibold cursor-pointer transition-all hover:shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRequiresOtp(false);
                      setSessionId("");
                      setOtpCode("");
                    }}
                    disabled={isLoading}
                    className="w-full h-11"
                  >
                    Back to Sign In
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
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit(onLogin)}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={cn(
                    "h-11 transition-all",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in-50 duration-200">
                    <span className="text-xs">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      onForgotPassword?.();
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={cn(
                      "h-11 pr-10 transition-all",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in-50 duration-200">
                    <span className="text-xs">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full h-11 font-semibold cursor-pointer transition-all hover:shadow-md"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
