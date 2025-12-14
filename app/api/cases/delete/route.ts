import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const deleteSchema = z.object({
  id: z.string(),
  userId: z.string(),
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

  const { id, userId } = parse.data;

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

    await caseRef.remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
