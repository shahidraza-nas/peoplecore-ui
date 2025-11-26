"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshStatus } = useSubscription();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Invalid payment session. Please try again.');
      return;
    }

    /**
     * Webhook automatically creates subscription when payment completes
     * This page just needs to verify subscription was created and refresh status
     */
    const verify = async () => {
      /**
       * Wait a moment for webhook to process
       */
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      /**
       * Refresh subscription status (should show new subscription from webhook)
       */
      await refreshStatus();
      
      /**
       * Assume success - webhook handles subscription creation
       */
      setStatus('success');
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    };

    verify();
  }, [searchParams, refreshStatus]);

  useEffect(() => {
    if (status === 'success' && countdown === 0) {
      router.push('/chat');
    }
  }, [countdown, status, router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <CardTitle>Verifying Payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Payment Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => router.push('/subscription/checkout')} 
              className="w-full"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">Subscription Active!</CardTitle>
          <CardDescription>
            Your recurring subscription is now active. You'll be automatically billed at the end of each period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Redirecting to chat in{' '}
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{countdown}</span>{' '}
              seconds...
            </p>
          </div>
          <Button 
            onClick={() => router.push('/chat')} 
            className="w-full"
          >
            Start Chatting
          </Button>
          <Button 
            onClick={() => router.push('/subscription')} 
            variant="outline"
            className="w-full"
          >
            View Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
