import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
