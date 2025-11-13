"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Later: add API call for registration
        router.push("/login");
    };

    return (
        <Card className="w-full max-w-lg border border-zinc-300 bg-white/90 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-sm">
            <CardHeader className="space-y-3 text-center pt-8 pb-6">
                <CardTitle className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Create Your Account
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Join PeopleCore and start managing your team efficiently.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="bg-transparent border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-zinc-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-all duration-200"
                        >
                            Create Account
                        </Button>

                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200"
                            >
                                Login
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
            </Card>
    );
}
