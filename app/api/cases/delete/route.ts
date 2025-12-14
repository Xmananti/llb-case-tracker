import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const deleteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string().optional(), // Optional, but will verify if provided
});

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const parse = deleteSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }

  const { id, userId, organizationId } = parse.data;

  try {
    const caseRef = adminDb.ref(`cases/${id}`);
    const snapshot = await caseRef.once("value");
    const caseData = snapshot.val();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Verify ownership by userId (required)
    if (caseData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If both organizationId provided and case has organizationId, verify they match
    // This allows deletion of legacy cases (without organizationId) even if user has organizationId
    if (
      organizationId &&
      caseData.organizationId &&
      caseData.organizationId !== organizationId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If case has organizationId but user doesn't provide one, still allow deletion
    // (user might be deleting their own legacy case that was migrated)
    // The userId check above is sufficient for ownership verification

    await caseRef.remove();

    // Decrement organization case count if organizationId exists
    if (caseData.organizationId) {
      const orgRef = adminDb.ref(`organizations/${caseData.organizationId}`);
      const orgSnapshot = await orgRef.once("value");
      const orgData = orgSnapshot.val();

      if (orgData) {
        const currentCases = Math.max(0, (orgData.currentCases || 1) - 1);
        await orgRef.update({
          currentCases,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
