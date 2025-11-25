"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { getSubscriptionHistory } from "@/actions/subscription.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  CalendarDays, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { SubscriptionStatus as Status, Subscription } from "@/types";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    subscription, 
    hasAccess, 
    daysRemaining, 
    isInGracePeriod,
    loading, 
    refreshStatus,
    cancelSubscription 
  } = useSubscription();
  
  const [cancelling, setCancelling] = useState(false);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      const result = await getSubscriptionHistory();
      if (result.success && result.data) {
        // API returns data in subscriptions array
        const data = result.data as any;
        setHistory(data.subscriptions || []);
      }
      setLoadingHistory(false);
    };
    loadHistory();
  }, [user]);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    const success = await cancelSubscription();
    setCancelling(false);
    
    if (success) {
      await refreshStatus();
    }
  };

  const getStatusBadge = (status?: Status) => {
    const badges = {
      [Status.ACTIVE]: <Badge className="bg-green-500">Active</Badge>,
      [Status.INACTIVE]: <Badge variant="secondary">Inactive</Badge>,
      [Status.CANCELLED]: <Badge variant="destructive">Cancelled</Badge>,
      [Status.EXPIRED]: <Badge variant="outline" className="border-orange-500 text-orange-500">Expired</Badge>,
    };
    return status ? badges[status] : <Badge variant="secondary">No Subscription</Badge>;
  };

  const getDaysRemainingProgress = () => {
    if (!subscription || !daysRemaining) return 0;
    
    const totalDays = 30; // Assuming monthly subscription
    const progress = ((totalDays - Math.abs(daysRemaining)) / totalDays) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Admin view
  if (user?.role === 'Admin') {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-zinc-500">You have admin access to all features</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle>Admin Access</CardTitle>
            </div>
            <CardDescription>
              As an administrator, you have unrestricted access to all chat features without requiring a subscription.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // No subscription
  if (!subscription) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-zinc-500">Manage your subscription and billing</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle>No Active Subscription</CardTitle>
            </div>
            <CardDescription>
              Subscribe now to access chat features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/subscription/checkout')} size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has subscription
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-zinc-500">Manage your subscription and billing</p>
        </div>
        <Button onClick={refreshStatus} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Status</CardTitle>
            {getStatusBadge(subscription.status)}
          </div>
          <CardDescription>
            {subscription.plan_type === 'chat_monthly' ? 'Monthly' : 'Yearly'} Plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays className="w-4 h-4" />
                Period Start
              </div>
              <p className="font-medium">
                {format(new Date(subscription.current_period_start), 'PPP')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays className="w-4 h-4" />
                Period End
              </div>
              <p className="font-medium">
                {format(new Date(subscription.current_period_end), 'PPP')}
              </p>
            </div>
          </div>

          {/* Days Remaining */}
          {subscription.status === Status.ACTIVE && daysRemaining !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </span>
                <span className="text-sm text-zinc-500">
                  {Math.round(getDaysRemainingProgress())}%
                </span>
              </div>
              <Progress value={getDaysRemainingProgress()} className="h-2" />
              
              {isInGracePeriod && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You're in the 3-day grace period. Renew soon to continue using chat features.
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Amount Paid</span>
            <span className="text-lg font-bold">
              ${subscription.amount} {subscription.currency.toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {subscription.status === Status.EXPIRED || subscription.status === Status.CANCELLED ? (
              <Button onClick={() => router.push('/subscription/checkout')} className="flex-1">
                Renew Subscription
              </Button>
            ) : subscription.status === Status.ACTIVE ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1" disabled={cancelling}>
                    {cancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your subscription immediately. You will lose access to chat features.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Access Status */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {hasAccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-zinc-500">You have access to chat features</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Inactive</p>
                  <p className="text-sm text-zinc-500">Subscribe to access chat features</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your subscription payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>No payment history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {format(new Date(sub.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {sub.plan_type === 'chat_monthly' ? 'Monthly' : 'Yearly'}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {format(new Date(sub.current_period_start), 'MMM dd')} - {format(new Date(sub.current_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        ${sub.amount} {sub.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sub.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
