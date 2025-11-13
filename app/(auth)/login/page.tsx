"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [isResetOpen, setIsResetOpen] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Later: replace with actual login logic (API call)
        router.push("/dashboard");
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        // Later: replace with actual API call
        toast.success(`Password reset link sent to ${resetEmail}`);
        setIsResetOpen(false);
        setResetEmail("");
    };

    return (
        <Card className="w-full max-w-lg border border-zinc-300 bg-white/90 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-sm">
            <CardHeader className="space-y-3 text-center pt-8 pb-6">
                <CardTitle className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Please sign in to your account
                </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                                type="button"
                                onClick={() => setIsResetOpen(true)}
                                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-all duration-200"
                    >
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Don’t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/register")}
                            className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                            Register
                        </button>
                    </p>
                    <div className="pt-4 text-center">
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="flex items-center justify-center mx-auto text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </button>
                    </div>
                </form>
            </CardContent>

            {/* Forgot Password Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Reset Password
                        </DialogTitle>
                        <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResetOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Send Reset Link
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
