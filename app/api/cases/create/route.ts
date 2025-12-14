import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const caseSchema = z.object({
  title: z.string().min(2, "Case title is required"),
  description: z.string().min(2, "Description is required"),
  caseNumber: z.string().optional(),
  caseCategory: z.string().optional(), // O.S, C.C, S.C, Crl.P, W.P, etc.
  court: z.string().optional(),
  courtComplex: z.string().optional(),
  benchJudgeName: z.string().optional(),
  plaintiff: z.string().optional(),
  defendant: z.string().optional(),
  petitioner: z.string().optional(),
  respondent: z.string().optional(),
  complainant: z.string().optional(),
  accused: z.string().optional(),
  advocateForPetitioner: z.string().optional(),
  advocateForRespondent: z.string().optional(),
  publicProsecutor: z.string().optional(),
  seniorCounsel: z.string().optional(),
  vakalatFiled: z.boolean().optional(),
  currentStage: z.string().optional(),
  lastHearingDate: z.string().optional(),
  nextHearingDate: z.string().optional(),
  hearingPurpose: z.string().optional(),
  notes: z.string().optional(),
  caseType: z.string().optional(),
  status: z
    .enum([
      "pending",
      "admitted",
      "dismissed",
      "allowed",
      "disposed",
      "withdrawn",
      "compromised",
      "stayed",
      "appeal_filed",
    ])
    .optional(),
  filingDate: z.string().optional(),
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
    caseCategory,
    court,
    courtComplex,
    benchJudgeName,
    plaintiff,
    defendant,
    petitioner,
    respondent,
    complainant,
    accused,
    advocateForPetitioner,
    advocateForRespondent,
    publicProsecutor,
    seniorCounsel,
    vakalatFiled,
    currentStage,
    lastHearingDate,
    nextHearingDate,
    hearingPurpose,
    notes,
    caseType,
    status,
    filingDate,
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
      caseCategory: caseCategory || "",
      court: court || "",
      courtComplex: courtComplex || "",
      benchJudgeName: benchJudgeName || "",
      plaintiff: plaintiff || "",
      defendant: defendant || "",
      petitioner: petitioner || "",
      respondent: respondent || "",
      complainant: complainant || "",
      accused: accused || "",
      advocateForPetitioner: advocateForPetitioner || "",
      advocateForRespondent: advocateForRespondent || "",
      publicProsecutor: publicProsecutor || "",
      seniorCounsel: seniorCounsel || "",
      vakalatFiled: vakalatFiled || false,
      currentStage: currentStage || "",
      lastHearingDate: lastHearingDate || "",
      nextHearingDate: nextHearingDate || "",
      hearingPurpose: hearingPurpose || "",
      notes: notes || "",
      caseType: caseType || "",
      status: status || "pending",
      filingDate: filingDate || "",
      userId,
      organizationId,
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
