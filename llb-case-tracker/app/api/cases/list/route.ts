import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const organizationId = req.nextUrl.searchParams.get("organizationId");

  if (!userId && !organizationId) {
    return NextResponse.json(
      { error: "userId or organizationId required" },
      { status: 400 }
    );
  }

  try {
    // If organizationId provided, get user's organization first to verify access
    let userOrgId = organizationId;

    if (userId && !organizationId) {
      // Get user's organization
      try {
        const userRef = adminDb.ref(`users/${userId}`);
        const userSnapshot = await userRef.once("value");
        const userData = userSnapshot.val();

        if (!userData) {
          // User doesn't exist in database yet - return empty array
          return NextResponse.json([]);
        }

        userOrgId = userData.organizationId;
        // Note: If userOrgId is null/undefined, we'll show legacy cases (cases without organizationId)
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        // If we can't fetch user data, return empty array instead of error
        return NextResponse.json([]);
      }
    }

    const casesRef = adminDb.ref("cases");
    const snapshot = await casesRef.once("value");
    const cases = snapshot.val() || {};

    // Filter cases by organizationId (multi-tenancy)
    let filteredCases = Object.entries(cases)
      .filter(([_, caseData]: [string, any]) => {
        // First, filter by userId (must belong to this user)
        if (userId && caseData.userId !== userId) {
          return false;
        }

        // If user has organizationId
        if (userOrgId) {
          // Show cases that:
          // 1. Have matching organizationId (new multi-tenant cases)
          // 2. OR don't have organizationId but belong to this user (legacy cases for migration)
          if (caseData.organizationId) {
            // Case has organizationId - must match user's organization
            return caseData.organizationId === userOrgId;
          } else {
            // Legacy case without organizationId - show it if it belongs to this user
            // This allows users to see their old cases during migration
            return true;
          }
        } else {
          // User has no organization - show only legacy cases (without organizationId)
          // that belong to this user
          if (caseData.organizationId) {
            // Case has organizationId but user doesn't - exclude it
            return false;
          }
          // Show legacy cases that belong to this user
          return true;
        }
      })
      .map(([id, caseData]: [string, any]) => ({
        id,
        ...caseData,
      }));

    return NextResponse.json(filteredCases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
