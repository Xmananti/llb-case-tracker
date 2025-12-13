import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  userId: z.string(),
});

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const parse = schema.safeParse(body);
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
    const existingCase = snapshot.val();

    if (!existingCase || existingCase.userId !== userId) {
      return NextResponse.json(
        { error: "Not found or forbidden" },
        { status: 404 }
      );
    }

    await caseRef.remove();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
