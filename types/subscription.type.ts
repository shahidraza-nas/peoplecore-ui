export interface Subscription {
    id: number;
    uid: string;
    user_id: number;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    status: SubscriptionStatus;
    plan_type: PlanType;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end?: boolean;
    amount: number;
    currency: string;
    cancelled_at?: string;
    expiry_notification_sent: boolean;
    created_at: string;
    updated_at: string;
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export enum PlanType {
    CHAT_MONTHLY = 'chat_monthly',
    CHAT_YEARLY = 'chat_yearly',
}

export interface SubscriptionStatusResponse {
    hasAccess: boolean;
    subscription: Subscription | null;
}

export interface CheckoutSessionResponse {
    sessionUrl: string;
    sessionId: string;
}

export interface CreateCheckoutData {
    amount?: number;
    planType?: string;
}