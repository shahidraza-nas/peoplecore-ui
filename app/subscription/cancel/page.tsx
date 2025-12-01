"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
              If you encountered any issues during checkout, please try again or contact our support team.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/subscription/checkout')} 
              className="w-full"
              size="lg"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
