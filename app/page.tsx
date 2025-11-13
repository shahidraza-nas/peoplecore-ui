"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Users, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100 transition-colors">
      <AppHeader />

      {/* Hero Section */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <TypographyH1>
              Welcome to{" "}
              <span className="bg-gradient-to-r from-neutral-800 to-stone-700 bg-clip-text text-transparent">
                PeopleCore
              </span>
            </TypographyH1>
            <TypographyP>
              Connect with your team, manage conversations, and stay organized.
            </TypographyP>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="px-8 py-6 text-lg bg-neutral-900 hover:bg-zinc-800 text-zinc-50 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
              className="px-8 py-6 text-lg border-2 border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  Real-time Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                  Instant messaging with your team members. Stay connected and collaborate in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  People Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                  Browse and connect with team members. View profiles and start conversations easily.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  Simple & Clean
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                  Clean interface focused on what matters. No clutter, just essential features.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 rounded-xl">
                  <Users className="w-5 h-5 text-zinc-50 dark:text-zinc-900" />
                </div>
                <span className="text-lg font-bold">PeopleCore</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Connect, collaborate, and stay organized with your team.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} PeopleCore. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <Users className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
