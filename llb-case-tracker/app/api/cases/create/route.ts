import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const caseSchema = z.object({
  title: z.string().min(2, "Case title is required"),
  description: z.string().min(2, "Description is required"),
  caseNumber: z.string().optional(),
  court: z.string().optional(),
  oppositeParty: z.string().optional(),
  caseType: z.string().optional(),
  status: z.enum(["active", "closed", "pending", "on_hold"]).optional(),
  filingDate: z.string().optional(),
  nextHearingDate: z.string().optional(),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = caseSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }
  const {
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
    const casesRef = adminDb.ref("cases");
    const newCaseRef = casesRef.push();

    const caseData = {
      title,
      description,
      caseNumber: caseNumber || "",
      court: court || "",
      oppositeParty: oppositeParty || "",
      caseType: caseType || "",
      status: status || "active",
      filingDate: filingDate || "",
      nextHearingDate: nextHearingDate || "",
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newCaseRef.set(caseData);

    return NextResponse.json(
      {
        id: newCaseRef.key,
        ...caseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}
