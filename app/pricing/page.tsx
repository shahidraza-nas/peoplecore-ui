"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 10 team members",
        "Basic employee directory",
        "Email support",
        "1GB storage"
      ],
      action: "free"
    },
    {
      name: "Pro Monthly",
      price: "$10",
      description: "Unlock chat features with monthly billing",
      features: [
        "All Free features",
        "Unlimited real-time messaging",
        "File sharing in chat",
        "Typing indicators & read receipts",
        "Priority support",
        "Cancel anytime"
      ],
      popular: true,
      action: "pro"
    },
    {
      name: "Pro Yearly",
      price: "$80",
      description: "Best value with yearly billing (Save $40)",
      features: [
        "All Pro Monthly features",
        "2 months free",
        "Priority support",
        "Early access to features",
        "Best long-term value",
        "Cancel anytime"
      ],
      popular: false,
      action: "pro"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "All Pro features",
        "Unlimited team members",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited storage",
        "Custom branding",
        "SLA guarantee"
      ],
      action: "enterprise"
    }
  ];

  const handlePlanSelect = (action: string) => {
    if (action === "free") {
      // Free plan - redirect to register if not logged in
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/register");
      }
    } else if (action === "pro") {
      // Pro plan - redirect to checkout if logged in, otherwise register
      if (user) {
        router.push("/subscription/checkout");
      } else {
        router.push("/register");
      }
    } else if (action === "enterprise") {
      // Enterprise - contact page or email
      router.push("/about");
    }
  };

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
                  onClick={() => handlePlanSelect(plan.action)}
                >
                  {plan.action === "enterprise" ? "Contact Us" : user && plan.action === "pro" ? "Subscribe Now" : "Get Started"}
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
