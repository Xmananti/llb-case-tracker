import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  try {
    const caseRef = adminDb.ref(`cases/${caseId}`);
    const snapshot = await caseRef.once("value");
    const caseData = snapshot.val();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Verify ownership if userId is provided
    if (userId && caseData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      id: caseId,
      ...caseData,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}
