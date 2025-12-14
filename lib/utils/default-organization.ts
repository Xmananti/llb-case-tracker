import { adminDb } from "../firebase/admin";
import { SUBSCRIPTION_PLANS } from "../types/organization";

const DEFAULT_ORG_NAME = "Default Organization";
const DEFAULT_ORG_EMAIL = "default@llb-case-tracker.com";

/**
 * Gets or creates a default organization for users without one
 * @returns The default organization ID
 */
export async function getOrCreateDefaultOrganization(): Promise<string> {
  try {
    // Check if Admin SDK is available
    try {
      adminDb.ref("test");
    } catch {
      throw new Error("Firebase Admin SDK is not configured");
    }

    // Look for existing default organization
    const orgsRef = adminDb.ref("organizations");
    const snapshot = await orgsRef.once("value");
    const orgs = snapshot.val() || {};

    // Find default organization (by name or email)
    for (const [id, orgData] of Object.entries(orgs)) {
      const org = orgData as any;
      if (
        org.name === DEFAULT_ORG_NAME ||
        org.email === DEFAULT_ORG_EMAIL ||
        org.isDefault === true
      ) {
        return id;
      }
    }

    // Create default organization if it doesn't exist
    const plan = SUBSCRIPTION_PLANS["free"];
    const now = new Date();

    // Build organization data, omitting undefined values (Firebase doesn't accept undefined)
    const organizationData: any = {
      name: DEFAULT_ORG_NAME,
      email: DEFAULT_ORG_EMAIL,
      phone: "",
      address: "",
      domain: "",
      subscriptionPlan: "free" as const,
      subscriptionStatus: "active" as const,
      subscriptionStartDate: now.toISOString(),
      maxUsers: plan.maxUsers,
      maxCases: plan.maxCases,
      currentUsers: 0,
      currentCases: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: "system",
      isDefault: true, // Mark as default organization
    };

    // Only include optional date fields if they have values
    // For free plan, we don't need subscriptionEndDate or trialEndDate
    // But we can set them to null if needed for consistency
    // For now, we'll omit them entirely

    const newOrgRef = orgsRef.push();
    await newOrgRef.set(organizationData);

    return newOrgRef.key!;
  } catch (error) {
    console.error("Error getting/creating default organization:", error);
    throw error;
  }
}

/**
 * Assigns a user to the default organization if they don't have one
 * @param userId The user ID
 * @returns The organization ID (existing or newly assigned)
 */
export async function ensureUserHasOrganization(
  userId: string
): Promise<string> {
  try {
    // Check if Admin SDK is available
    try {
      adminDb.ref("test");
    } catch {
      throw new Error("Firebase Admin SDK is not configured");
    }

    // Get user data
    const userRef = adminDb.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val();

    // If user doesn't exist, create user record
    if (!userData) {
      // We need email from auth, but for now just create basic record
      const defaultOrgId = await getOrCreateDefaultOrganization();
      const newUserData = {
        uid: userId,
        email: "",
        name: "",
        organizationId: defaultOrgId,
        role: "lawyer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await userRef.set(newUserData);

      // Increment organization user count
      const orgRef = adminDb.ref(`organizations/${defaultOrgId}`);
      const orgSnapshot = await orgRef.once("value");
      const orgData = orgSnapshot.val();
      if (orgData) {
        await orgRef.update({
          currentUsers: (orgData.currentUsers || 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      }

      return defaultOrgId;
    }

    // If user already has organizationId, return it
    if (userData.organizationId) {
      return userData.organizationId;
    }

    // User exists but has no organization - assign default
    const defaultOrgId = await getOrCreateDefaultOrganization();
    await userRef.update({
      organizationId: defaultOrgId,
      updatedAt: new Date().toISOString(),
    });

    // Increment organization user count
    const orgRef = adminDb.ref(`organizations/${defaultOrgId}`);
    const orgSnapshot = await orgRef.once("value");
    const orgData = orgSnapshot.val();
    if (orgData) {
      await orgRef.update({
        currentUsers: (orgData.currentUsers || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return defaultOrgId;
  } catch (error) {
    console.error("Error ensuring user has organization:", error);
    throw error;
  }
}
