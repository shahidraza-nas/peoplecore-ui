import RegisterForm from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <RegisterForm />
        </div>
    );
}