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
  RefreshCw,
  Sparkles,
  Crown,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  DollarSign
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
import { cn } from "@/lib/utils";

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelImmediate, setCancelImmediate] = useState(false);
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
    setShowCancelDialog(false);
    setCancelling(true);
    const success = await cancelSubscription(cancelImmediate);
    setCancelling(false);

    if (success) {
      await refreshStatus();
      setCancelImmediate(false);
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  // Admin view
  if (user?.role === 'Admin') {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Crown className="w-8 h-8" />
              </div>
              <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-400 border-0">
                ADMIN
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Administrator Access</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              You have unrestricted access to all premium features without requiring a subscription.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Full Access", desc: "All features unlocked" },
            { icon: Zap, title: "No Limits", desc: "Unlimited usage" },
            { icon: Sparkles, title: "Premium Support", desc: "Priority assistance" }
          ].map((feature, i) => (
            <Card key={i} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No subscription
  if (!subscription) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-8">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Get Started
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Unlock Premium Chat Features
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mb-8">
              Subscribe now to access real-time messaging, unlimited conversations, and exclusive features designed for seamless communication.
            </p>
            
            <Button 
              onClick={() => router.push('/subscription/checkout')} 
              size="lg"
              className="bg-white text-cyan-600 hover:bg-white/90 font-semibold h-12 px-8"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Start Your Subscription
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Zap,
              title: "Real-Time Messaging",
              description: "Instant message delivery with live typing indicators and read receipts"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "End-to-end encrypted conversations with enterprise-grade security"
            },
            {
              icon: TrendingUp,
              title: "Unlimited Chats",
              description: "No limits on conversations, messages, or file sharing"
            },
            {
              icon: Clock,
              title: "Message History",
              description: "Access complete chat history with powerful search capabilities"
            }
          ].map((feature, i) => (
            <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Card */}
        <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users enjoying seamless communication
            </p>
            <Button onClick={() => router.push('/subscription/checkout')} size="lg">
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has subscription
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Subscription</h1>
          <p className="text-muted-foreground">Manage your plan and billing preferences</p>
        </div>
        <Button onClick={refreshStatus} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Premium Status Hero */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-8 md:p-10 text-white transition-all duration-300",
        subscription.status === Status.ACTIVE 
          ? "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
          : subscription.status === Status.EXPIRED
          ? "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600"
          : "bg-gradient-to-br from-zinc-500 via-gray-500 to-slate-600"
      )}>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {subscription.plan_type === 'chat_monthly' ? 'Monthly Premium' : 'Yearly Premium'}
                  </h2>
                  {getStatusBadge(subscription.status)}
                </div>
                <p className="text-white/80 text-sm">
                  {subscription.status === Status.ACTIVE && daysRemaining !== null && daysRemaining > 0
                    ? `${daysRemaining} days remaining in your billing cycle`
                    : subscription.status === Status.EXPIRED
                    ? 'Your subscription has expired'
                    : 'Subscription status updated'}
                </p>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <div className="text-white/70 text-sm mb-1">Total Paid</div>
              <div className="text-3xl font-bold">
                ${subscription.amount}
              </div>
              <div className="text-white/70 text-xs uppercase">
                {subscription.currency}
              </div>
            </div>
          </div>

          {/* Progress Bar for Active Subscriptions */}
          {subscription.status === Status.ACTIVE && daysRemaining !== null && daysRemaining > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90 font-medium">Billing Cycle Progress</span>
                <span className="text-white/70">{Math.round(getDaysRemainingProgress())}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${getDaysRemainingProgress()}%` }}
                />
              </div>
            </div>
          )}

          {/* Grace Period Warning */}
          {isInGracePeriod && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Grace Period Active:</strong> Renew within 3 days to maintain uninterrupted access to chat features.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Details Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Period Start</h3>
            </div>
            <p className="text-2xl font-bold">
              {format(new Date(subscription.current_period_start), 'MMM dd')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(subscription.current_period_start), 'yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Period End</h3>
            </div>
            <p className="text-2xl font-bold">
              {format(new Date(subscription.current_period_end), 'MMM dd')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(subscription.current_period_end), 'yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Amount Paid</h3>
            </div>
            <p className="text-2xl font-bold">
              ${subscription.amount}
            </p>
            <p className="text-sm text-muted-foreground mt-1 uppercase">
              {subscription.currency}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Access Status & Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chat Access Status */}
        <Card className="border-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              {hasAccess ? (
                <>
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Access Enabled</span>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span>Access Disabled</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {hasAccess 
                ? 'You have full access to all chat features'
                : 'Renew subscription to restore access'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {[
                { label: 'Real-time Messaging', enabled: hasAccess },
                { label: 'Message History', enabled: hasAccess },
                { label: 'Read Receipts', enabled: hasAccess },
              ].map((feature, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{feature.label}</span>
                  {feature.enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Manage Subscription
            </CardTitle>
            <CardDescription>
              Control your subscription settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription.status === Status.EXPIRED || subscription.status === Status.CANCELLED ? (
              <Button 
                onClick={() => router.push('/subscription/checkout')} 
                className="w-full h-12"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Renew Subscription
              </Button>
            ) : subscription.status === Status.ACTIVE ? (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={cancelling}>
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
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Choose when you want your subscription to end.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <button
                        onClick={() => setCancelImmediate(false)}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 text-left transition-all",
                          !cancelImmediate
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center",
                            !cancelImmediate ? "border-primary" : "border-muted-foreground"
                          )}>
                            {!cancelImmediate && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">Cancel at Period End</h4>
                            <p className="text-sm text-muted-foreground">
                              Keep access until {subscription?.current_period_end 
                                ? format(new Date(subscription.current_period_end), 'MMM dd, yyyy')
                                : 'end of period'
                              }. You won't be charged again.
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setCancelImmediate(true)}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 text-left transition-all",
                          cancelImmediate
                            ? "border-destructive bg-destructive/5"
                            : "border-border hover:border-destructive/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center",
                            cancelImmediate ? "border-destructive" : "border-muted-foreground"
                          )}>
                            {cancelImmediate && <div className="w-3 h-3 rounded-full bg-destructive" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">Cancel Immediately</h4>
                            <p className="text-sm text-muted-foreground">
                              Lose access to chat features right away. No refund will be issued.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCancelImmediate(false)}>
                        Keep Subscription
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription} 
                        className={cn(
                          cancelImmediate 
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        )}
                      >
                        {cancelImmediate ? 'Cancel Now' : 'Cancel at Period End'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your subscription payment records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted inline-block mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No payment history yet</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction records will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((sub, index) => (
                <div 
                  key={sub.uid}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                    index === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <CalendarDays className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {format(new Date(sub.created_at), 'MMMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.plan_type === 'chat_monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Period</p>
                      <p className="text-sm font-medium">
                        {format(new Date(sub.current_period_start), 'MMM dd')} - {format(new Date(sub.current_period_end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Amount</p>
                      <p className="text-lg font-bold text-primary">
                        ${sub.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
