import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

/**
 * Migration endpoint to assign organizationId to existing cases
 * This helps migrate legacy cases to the new multi-tenant structure
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, organizationId } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "userId and organizationId are required" },
        { status: 400 }
      );
    }

    // Get all cases for this user
    const casesRef = adminDb.ref("cases");
    const snapshot = await casesRef.once("value");
    const allCases = snapshot.val() || {};

    const updates: { [key: string]: any } = {};
    let migratedCount = 0;

    // Find cases that belong to this user but don't have organizationId
    Object.entries(allCases).forEach(([caseId, caseData]: [string, any]) => {
      if (caseData.userId === userId && !caseData.organizationId) {
        updates[`cases/${caseId}/organizationId`] = organizationId;
        updates[`cases/${caseId}/updatedAt`] = new Date().toISOString();
        migratedCount++;
      }
    });

    if (migratedCount === 0) {
      return NextResponse.json({
        message: "No cases to migrate",
        migrated: 0,
      });
    }

    // Update all cases in a single transaction
    const rootRef = adminDb.ref();
    await rootRef.update(updates);

    // Update organization case count
    const orgRef = adminDb.ref(`organizations/${organizationId}`);
    const orgSnapshot = await orgRef.once("value");
    const orgData = orgSnapshot.val();

    if (orgData) {
      const currentCases = orgData.currentCases || 0;
      await orgRef.update({
        currentCases: currentCases + migratedCount,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      message: `Successfully migrated ${migratedCount} case(s)`,
      migrated: migratedCount,
    });
  } catch (error) {
    console.error("Error migrating cases:", error);
    return NextResponse.json(
      { error: "Failed to migrate cases" },
      { status: 500 }
    );
  }
}
