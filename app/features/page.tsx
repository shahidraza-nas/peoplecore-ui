"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Lock, Zap, BarChart3, Globe } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Instant messaging with your team members. Stay connected and collaborate in real-time with typing indicators and read receipts."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Employee Management",
      description: "Comprehensive employee directory with CRUD operations. Manage profiles, contact information, and organizational structure."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "JWT-based authentication with password reset functionality. Your data is protected with industry-standard security."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Built with Next.js 16 for optimal performance. Server-side rendering and smart caching for blazing-fast load times."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track team activity, message statistics, and user engagement with intuitive visualizations and insights."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Dark Mode",
      description: "Beautiful dark mode that's easy on the eyes. Automatically syncs with your system preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Features</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Everything you need to manage your team and communicate effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    {feature.icon}
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
