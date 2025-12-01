import { z } from "zod";

/**
 * Schema for creating a checkout session
 * Used when user clicks "Subscribe" button
 */
export const CheckoutSchema = z.object({
    planType: z.enum(['chat_monthly', 'chat_yearly']).default('chat_monthly'),
    amount: z.number().positive().min(1).optional().default(10),
});

/**
 * Schema for cancelling subscription
 * Used in cancel confirmation dialog
 */
export const CancelSubscriptionSchema = z.object({
    confirmCancel: z.boolean().refine(val => val === true, {
        message: "You must confirm cancellation by checking the box",
    }),
    reason: z.string().min(10, "Please provide a reason (minimum 10 characters)").optional(),
});

/**
 * Schema for processing payment callback
 * Used on success page when processing session_id from URL
 */
export const ProcessPaymentSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required"),
});

/**
 * Type exports for use in components
 */
export type CheckoutFormData = z.infer<typeof CheckoutSchema>;
export type CancelSubscriptionFormData = z.infer<typeof CancelSubscriptionSchema>;
export type ProcessPaymentFormData = z.infer<typeof ProcessPaymentSchema>;