import { useState, useCallback, useEffect } from 'react';
import { Subscription, SubscriptionStatus, ApiError } from '@/types';
import { API } from '@/lib/fetch';
import { toast } from 'sonner';

interface SubscriptionStatusResponse {
    subscription: Subscription | null;
    access: {
        hasAccess: boolean;
        isActive: boolean;
        isCancelling: boolean;
    };
    billing: {
        status: string;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
        cancelledAt: string | null;
    } | null;
}

interface CheckoutSessionResponse {
    sessionUrl: string;
    sessionId: string;
}

interface UseSubscriptionReturn {
    subscription: Subscription | null;
    hasAccess: boolean;
    daysRemaining: number | null;
    isInGracePeriod: boolean;
    loading: boolean;
    error: ApiError | null;
    getStatus: () => Promise<void>;
    createCheckout: (data?: { amount?: number; planType?: string }) => Promise<string | null>;
    processPayment: (sessionId: string) => Promise<boolean>;
    cancelSubscription: (immediate?: boolean) => Promise<boolean>;
    refreshStatus: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isInGracePeriod, setIsInGracePeriod] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    /**
    * Calculate days remaining and grace period status
    */
    const calculateDaysRemaining = useCallback((sub: Subscription | null) => {
        if (!sub) {
            setDaysRemaining(null);
            setIsInGracePeriod(false);
            return;
        }

        const now = new Date();
        const periodEnd = new Date(sub.current_period_end);
        const gracePeriodEnd = new Date(periodEnd);
        /**
         * 3-day grace period
         */
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);
        const daysToEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysToGraceEnd = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setDaysRemaining(daysToEnd);

        /**
         * User is in grace period if subscription ended but grace period hasn't
         */
        setIsInGracePeriod(
            sub.status === SubscriptionStatus.ACTIVE &&
            daysToEnd < 0 &&
            daysToGraceEnd > 0
        );
    }, []);

    /*
    * Get subscription status
    */
    const getStatus = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await API.GetSubscriptionStatus();

            if (response.error) {
                throw response.error;
            }

            const data = response.data as SubscriptionStatusResponse;
            setSubscription(data.subscription);
            setHasAccess(data.access.hasAccess);
            calculateDaysRemaining(data.subscription);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError);
            setSubscription(null);
            setHasAccess(false);
            console.error('Failed to fetch subscription status:', apiError);
        } finally {
            setLoading(false);
        }
    }, [calculateDaysRemaining]);

    /**
   * Create Stripe checkout session and redirect
   */
    const createCheckout = useCallback(async (data?: { amount?: number; planType?: string }) => {
        setLoading(true);
        setError(null);
        const toastId = toast.loading('Creating checkout session...');
        
        try {
            const response = await API.CreateCheckoutSession(data || {});
            
            // Handle API-level errors (returned from backend)
            if (response.error) {
                const errorMsg = typeof response.error === 'string' 
                    ? response.error 
                    : (response.error as any)?.message || response.message || 'Failed to create checkout session';
                
                throw new Error(errorMsg);
            }

            // Validate response structure
            if (!response.data) {
                throw new Error('No response data received from server');
            }
            
            const checkoutData = response.data as CheckoutSessionResponse;
            
            if (!checkoutData.sessionUrl) {
                throw new Error('No session URL returned from server');
            }
            
            toast.success('Redirecting to payment...', { id: toastId });
            
            // Redirect to Stripe Checkout
            window.location.href = checkoutData.sessionUrl;
            return checkoutData.sessionId;
            
        } catch (err) {
            // Extract error message from various error formats
            let errorMessage = 'Failed to create checkout session';
            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err && typeof err === 'object') {
                const errObj = err as any;
                errorMessage = errObj.message || errObj.error?.message || errorMessage;
            }
            
            // Log error details for debugging
            console.error('Checkout error:', errorMessage, err);
            
            setError(err as ApiError);
            toast.error(errorMessage, {
                id: toastId,
                duration: 5000,
            });
            
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Process payment after Stripe redirect
     */
    const processPayment = useCallback(async (sessionId: string): Promise<boolean> => {
        if (!sessionId) {
            toast.error('Invalid session ID');
            return false;
        }

        setLoading(true);
        setError(null);
        const toastId = toast.loading('Verifying payment...');

        try {
            const response = await API.ProcessPayment(sessionId);

            if (response.error) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || response.message || 'Failed to process payment';
                throw new Error(errorMsg);
            }

            const processedSubscription = (response.data as any)?.subscription as Subscription;
            setSubscription(processedSubscription);
            setHasAccess(true);
            calculateDaysRemaining(processedSubscription);

            toast.success('Subscription activated successfully!', { id: toastId });
            return true;
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
            console.error('Payment processing error:', errorMessage, err);
            
            setError(err as ApiError);
            toast.error(errorMessage, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    }, [calculateDaysRemaining]);

    /**
     * Cancel subscription
     */
    const cancelSubscription = useCallback(async (immediate: boolean = false): Promise<boolean> => {
        setLoading(true);
        setError(null);
        const toastId = toast.loading('Cancelling subscription...');

        try {
            const response = await API.CancelSubscription(immediate);

            if (response.error) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || response.message || 'Failed to cancel subscription';
                throw new Error(errorMsg);
            }

            const cancelledSubscription = (response.data as any)?.subscription as Subscription;
            setSubscription(cancelledSubscription);
            setHasAccess(false);
            calculateDaysRemaining(cancelledSubscription);

            toast.success('Subscription cancelled successfully', { id: toastId });
            return true;
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
            console.error('Cancellation error:', errorMessage, err);
            
            setError(err as ApiError);
            toast.error(errorMessage, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    }, [calculateDaysRemaining]);

    /**
     * Refresh subscription status (alias for getStatus)
     */
    const refreshStatus = useCallback(async () => {
        await getStatus();
    }, [getStatus]);

    /**
     * Auto-fetch status on mount
     */
    useEffect(() => {
        getStatus();
    }, [getStatus]);

    return {
        subscription,
        hasAccess,
        daysRemaining,
        isInGracePeriod,
        loading,
        error,
        getStatus,
        createCheckout,
        processPayment,
        cancelSubscription,
        refreshStatus,
    };
}
