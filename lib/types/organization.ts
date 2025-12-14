export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  domain?: string;
  logo?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: "active" | "trial" | "expired" | "cancelled";
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  trialEndDate?: string;
  maxUsers: number;
  maxCases: number;
  currentUsers: number;
  currentCases: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin user ID who created this organization
}

export type SubscriptionPlan =
  | "free"
  | "starter"
  | "professional"
  | "enterprise";

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number; // Monthly price in USD
  maxUsers: number;
  maxCases: number;
  features: string[];
  trialDays: number;
}

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  SubscriptionPlanDetails
> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    maxUsers: 1,
    maxCases: 10,
    features: [
      "Basic case management",
      "Document storage (1GB)",
      "Email support",
    ],
    trialDays: 0,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 49,
    maxUsers: 5,
    maxCases: 100,
    features: [
      "All Free features",
      "5 team members",
      "100 cases",
      "Document storage (10GB)",
      "Priority email support",
      "Basic analytics",
    ],
    trialDays: 14,
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 149,
    maxUsers: 20,
    maxCases: 500,
    features: [
      "All Starter features",
      "20 team members",
      "500 cases",
      "Document storage (50GB)",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom branding",
    ],
    trialDays: 14,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    maxUsers: -1, // Unlimited
    maxCases: -1, // Unlimited
    features: [
      "All Professional features",
      "Unlimited users",
      "Unlimited cases",
      "Unlimited storage",
      "Dedicated support",
      "Custom integrations",
      "SSO",
      "Advanced security",
      "SLA guarantee",
    ],
    trialDays: 30,
  },
};

export interface UserRole {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "lawyer" | "assistant" | "viewer";
  permissions: string[];
  createdAt: string;
}
