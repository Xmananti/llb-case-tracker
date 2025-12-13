import { adminDb } from "../firebase/admin";
import { Organization } from "../types/organization";

/**
 * Check if organization subscription is active and within limits
 */
export async function checkSubscription(
  organizationId: string
): Promise<{ allowed: boolean; error?: string; organization?: Organization }> {
  try {
    const orgRef = adminDb.ref(`organizations/${organizationId}`);
    const snapshot = await orgRef.once("value");
    const orgData = snapshot.val() as Organization | null;

    if (!orgData) {
      return { allowed: false, error: "Organization not found" };
    }

    // Check subscription status
    if (
      orgData.subscriptionStatus === "expired" ||
      orgData.subscriptionStatus === "cancelled"
    ) {
      return {
        allowed: false,
        error: "Organization subscription is expired or cancelled",
        organization: orgData,
      };
    }

    // Check trial expiration
    if (orgData.subscriptionStatus === "trial" && orgData.trialEndDate) {
      const trialEnd = new Date(orgData.trialEndDate);
      const now = new Date();

      if (now > trialEnd) {
        return {
          allowed: false,
          error: "Trial period has expired",
          organization: orgData,
        };
      }
    }

    return { allowed: true, organization: orgData };
  } catch (error) {
    console.error("Error checking subscription:", error);
    return { allowed: false, error: "Failed to verify subscription" };
  }
}

/**
 * Check if organization can add more users
 */
export async function canAddUser(organizationId: string): Promise<{
  allowed: boolean;
  error?: string;
  currentUsers?: number;
  maxUsers?: number;
}> {
  try {
    const orgRef = adminDb.ref(`organizations/${organizationId}`);
    const snapshot = await orgRef.once("value");
    const orgData = snapshot.val();

    if (!orgData) {
      return { allowed: false, error: "Organization not found" };
    }

    const currentUsers = orgData.currentUsers || 0;
    const maxUsers = orgData.maxUsers || 0;

    // -1 means unlimited
    if (maxUsers === -1) {
      return { allowed: true, currentUsers, maxUsers: -1 };
    }

    if (currentUsers >= maxUsers) {
      return {
        allowed: false,
        error: `Organization has reached maximum user limit (${maxUsers})`,
        currentUsers,
        maxUsers,
      };
    }

    return { allowed: true, currentUsers, maxUsers };
  } catch (error) {
    console.error("Error checking user limit:", error);
    return { allowed: false, error: "Failed to verify user limit" };
  }
}

/**
 * Check if organization can add more cases
 */
export async function canAddCase(organizationId: string): Promise<{
  allowed: boolean;
  error?: string;
  currentCases?: number;
  maxCases?: number;
}> {
  try {
    const orgRef = adminDb.ref(`organizations/${organizationId}`);
    const snapshot = await orgRef.once("value");
    const orgData = snapshot.val();

    if (!orgData) {
      return { allowed: false, error: "Organization not found" };
    }

    const currentCases = orgData.currentCases || 0;
    const maxCases = orgData.maxCases || 0;

    // -1 means unlimited
    if (maxCases === -1) {
      return { allowed: true, currentCases, maxCases: -1 };
    }

    if (currentCases >= maxCases) {
      return {
        allowed: false,
        error: `Organization has reached maximum case limit (${maxCases})`,
        currentCases,
        maxCases,
      };
    }

    return { allowed: true, currentCases, maxCases };
  } catch (error) {
    console.error("Error checking case limit:", error);
    return { allowed: false, error: "Failed to verify case limit" };
  }
}
