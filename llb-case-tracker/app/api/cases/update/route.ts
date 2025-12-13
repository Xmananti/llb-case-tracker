import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  title: z.string().min(2),
  description: z.string().min(2),
  caseNumber: z.string().optional(),
  court: z.string().optional(),
  oppositeParty: z.string().optional(),
  caseType: z.string().optional(),
  status: z.enum(["active", "closed", "pending", "on_hold"]).optional(),
  filingDate: z.string().optional(),
  nextHearingDate: z.string().optional(),
  userId: z.string(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }
  const {
    id,
    title,
    description,
    caseNumber,
    court,
    oppositeParty,
    caseType,
    status,
    filingDate,
    nextHearingDate,
    userId,
  } = parse.data;

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

    const updateData = {
      title,
      description,
      caseNumber: caseNumber || "",
      court: court || "",
      oppositeParty: oppositeParty || "",
      caseType: caseType || "",
      status: status || "active",
      filingDate: filingDate || "",
      nextHearingDate: nextHearingDate || "",
      updatedAt: new Date().toISOString(),
      // Preserve original fields
      userId: existingCase.userId,
      createdAt: existingCase.createdAt,
    };

    await caseRef.update(updateData);

    return NextResponse.json({
      id,
      ...updateData,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}
