"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_code: phone ? "+1" : undefined,
        phone: phone || undefined,
      });
      router.push("/login");
    } catch (error) {
      // Error already handled by useAuth hook with toast
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-base">
          Join PeopleCore to manage your team efficiently
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="h-11 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                className="h-11 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              disabled={loading}
              className="h-11 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="h-11 pr-10 transition-all"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 pr-10 transition-all"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>⚠</span> Passwords do not match
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button 
            type="submit" 
            className="w-full h-11 font-semibold transition-all hover:shadow-md" 
            disabled={loading || password !== confirmPassword || !firstName || !lastName || !email}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
