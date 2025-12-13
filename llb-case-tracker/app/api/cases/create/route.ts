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
  organizationId: z.string(), // Required for multi-tenancy
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
    organizationId,
  } = parse.data;

  try {
    // Verify organization exists and check case limits
    const orgRef = adminDb.ref(`organizations/${organizationId}`);
    const orgSnapshot = await orgRef.once("value");
    const orgData = orgSnapshot.val();

    if (!orgData) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check subscription status
    if (
      orgData.subscriptionStatus === "expired" ||
      orgData.subscriptionStatus === "cancelled"
    ) {
      return NextResponse.json(
        { error: "Organization subscription is expired or cancelled" },
        { status: 403 }
      );
    }

    // Check case limit
    const maxCases = orgData.maxCases || 0;
    const currentCases = orgData.currentCases || 0;

    if (maxCases > 0 && currentCases >= maxCases) {
      return NextResponse.json(
        { error: "Organization has reached maximum case limit" },
        { status: 403 }
      );
    }

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
      organizationId, // Added for multi-tenancy
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newCaseRef.set(caseData);

    // Increment organization case count
    await orgRef.update({
      currentCases: currentCases + 1,
      updatedAt: new Date().toISOString(),
    });

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
