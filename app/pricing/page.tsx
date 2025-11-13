"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 10 team members",
        "Basic chat functionality",
        "Employee directory",
        "Email support",
        "1GB storage"
      ]
    },
    {
      name: "Pro",
      price: "$29",
      description: "For growing teams that need more",
      features: [
        "Up to 100 team members",
        "Advanced chat with file sharing",
        "Employee management & analytics",
        "Priority support",
        "50GB storage",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited team members",
        "All Pro features",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited storage",
        "Custom branding",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Choose the plan that's right for your team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border ${plan.popular ? 'border-zinc-900 dark:border-zinc-100 shadow-xl' : 'border-zinc-200 dark:border-zinc-800'} relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-zinc-500">/month</span>}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => router.push("/register")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
