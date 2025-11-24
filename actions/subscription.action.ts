"use server";

import { API } from "@/lib/fetch";

/**
 * Get current user's subscription status
 */
export async function getSubscriptionStatus() {
    try {
        const response = await API.GetSubscriptionStatus();
        return {
            success: !response.error,
            data: response.data,
            error: response.error,
            message: response.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'Failed to fetch subscription status',
        };
    }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(data?: { amount?: number; planType?: string }) {
    try {
        const response = await API.CreateCheckoutSession(data || {});
        return {
            success: !response.error,
            data: response.data,
            error: response.error,
            message: response.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'Failed to create checkout session',
        };
    }
}

/**
 * Process payment after successful Stripe checkout
 */
export async function processPayment(sessionId: string) {
    try {
        const response = await API.ProcessPayment(sessionId);
        return {
            success: !response.error,
            data: response.data,
            error: response.error,
            message: response.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'Failed to process payment',
        };
    }
}


/**
 * Cancel user's active subscription
 */
export async function cancelSubscription() {
    try {
        const response = await API.CancelSubscription();
        return {
            success: !response.error,
            data: response.data,
            error: response.error,
            message: response.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error,
            message: 'Failed to cancel subscription',
        };
    }
}

/**
 * Get subscription history (if backend endpoint exists)
 * Uncomment when GET /subscription/history is available
 */
// export async function getSubscriptionHistory(params?: { offset?: number; limit?: number }) {
//   try {
//     const response = await API.GetAll('subscription/history', params);
//     return {
//       success: !response.error,
//       data: response.data,
//       error: response.error,
//       message: response.message,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error,
//       message: 'Failed to fetch subscription history',
//     };
//   }
// }