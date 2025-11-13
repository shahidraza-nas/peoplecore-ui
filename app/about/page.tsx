"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About PeopleCore</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Built for teams who value simplicity and connection
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none mb-12">
          <Card className="border border-zinc-200 dark:border-zinc-800 mb-8">
            <CardContent className="pt-6">
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                PeopleCore was created with a simple mission: to make team communication and employee management effortless. 
                We believe that the best tools are the ones that get out of your way and let you focus on what matters most - 
                your team and your work.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border border-zinc-200 dark:border-zinc-800 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  To provide teams with the simplest, most effective communication and management tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Our Team</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  A small but passionate group of developers and designers who care about great user experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Our Values</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Simplicity, privacy, and putting users first in everything we build.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Why PeopleCore?</h2>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">•</span>
                  <span><strong className="text-zinc-900 dark:text-zinc-100">No Bloat:</strong> We include only the features you actually need, nothing more.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">•</span>
                  <span><strong className="text-zinc-900 dark:text-zinc-100">Privacy First:</strong> Your data belongs to you. We don't sell it or share it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">•</span>
                  <span><strong className="text-zinc-900 dark:text-zinc-100">Modern Design:</strong> Clean, beautiful interface that works great in light and dark mode.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">•</span>
                  <span><strong className="text-zinc-900 dark:text-zinc-100">Fast Performance:</strong> Built with cutting-edge technology for lightning-fast load times.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
