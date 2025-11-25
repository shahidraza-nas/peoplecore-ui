"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/types";

const plans = [
  {
    id: PlanType.CHAT_MONTHLY,
    name: "Monthly Plan",
    price: 10,
    period: "month",
    description: "Access to chat features for 1 month",
    features: [
      "Unlimited messaging",
      "Real-time notifications",
      "File sharing",
      "3-day grace period after expiration",
    ],
  },
  {
    id: PlanType.CHAT_YEARLY,
    name: "Yearly Plan",
    price: 100,
    period: "year",
    description: "Access to chat features for 1 year",
    savings: "Save $20",
    features: [
      "All Monthly Plan features",
      "Priority support",
      "Early access to new features",
      "Best value for long-term use",
    ],
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { createCheckout, loading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.CHAT_MONTHLY);

  const handleSubscribe = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    const sessionId = await createCheckout({
      amount: plan.price,
      planType: selectedPlan,
    });
    if (!sessionId && !loading) {
      console.error("Failed to create checkout session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select a subscription plan to unlock chat access
          </p>
        </div>

        <RadioGroup value={selectedPlan} onValueChange={(value: string) => setSelectedPlan(value as PlanType)}>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-2 border-primary shadow-lg"
                    : "border hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.savings && (
                  <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.savings}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                  </div>
                  <div className="flex items-baseline gap-1 pt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  ${plans.find((p) => p.id === selectedPlan)?.price}
                </span>
              </div>
              
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Checkout Session...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                You will be redirected to Stripe to complete your payment securely.
              </p>

              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
