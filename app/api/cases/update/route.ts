import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  title: z.string().min(2),
  description: z.string().min(2),
  plaintiffCase: z.string().optional(),
  defendantCase: z.string().optional(),
  workToBeDone: z.string().optional(),
  caseNumber: z.string().optional(),
  caseCategory: z.string().optional(),
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
  purposeOfHearingStage: z.string().optional(),
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
    plaintiffCase,
    defendantCase,
    workToBeDone,
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
    purposeOfHearingStage,
    notes,
    caseType,
    status,
    filingDate,
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

    const updateData: any = {
      title,
      description,
      plaintiffCase:
        plaintiffCase !== undefined
          ? plaintiffCase || ""
          : existingCase.plaintiffCase || "",
      defendantCase:
        defendantCase !== undefined
          ? defendantCase || ""
          : existingCase.defendantCase || "",
      workToBeDone:
        workToBeDone !== undefined
          ? workToBeDone || ""
          : existingCase.workToBeDone || "",
      caseNumber: caseNumber || "",
      caseCategory:
        caseCategory !== undefined
          ? caseCategory || ""
          : existingCase.caseCategory || "",
      court: court || "",
      courtComplex:
        courtComplex !== undefined
          ? courtComplex || ""
          : existingCase.courtComplex || "",
      benchJudgeName:
        benchJudgeName !== undefined
          ? benchJudgeName || ""
          : existingCase.benchJudgeName || "",
      plaintiff: plaintiff || "",
      defendant: defendant || "",
      petitioner:
        petitioner !== undefined
          ? petitioner || ""
          : existingCase.petitioner || "",
      respondent:
        respondent !== undefined
          ? respondent || ""
          : existingCase.respondent || "",
      complainant:
        complainant !== undefined
          ? complainant || ""
          : existingCase.complainant || "",
      accused:
        accused !== undefined ? accused || "" : existingCase.accused || "",
      advocateForPetitioner:
        advocateForPetitioner !== undefined
          ? advocateForPetitioner || ""
          : existingCase.advocateForPetitioner || "",
      advocateForRespondent:
        advocateForRespondent !== undefined
          ? advocateForRespondent || ""
          : existingCase.advocateForRespondent || "",
      publicProsecutor:
        publicProsecutor !== undefined
          ? publicProsecutor || ""
          : existingCase.publicProsecutor || "",
      seniorCounsel:
        seniorCounsel !== undefined
          ? seniorCounsel || ""
          : existingCase.seniorCounsel || "",
      vakalatFiled:
        vakalatFiled !== undefined
          ? vakalatFiled
          : existingCase.vakalatFiled || false,
      currentStage: currentStage || "",
      lastHearingDate:
        lastHearingDate !== undefined
          ? lastHearingDate || ""
          : existingCase.lastHearingDate || "",
      nextHearingDate: nextHearingDate || "",
      hearingPurpose:
        hearingPurpose !== undefined
          ? hearingPurpose || ""
          : existingCase.hearingPurpose || "",
      purposeOfHearingStage:
        purposeOfHearingStage !== undefined
          ? purposeOfHearingStage || ""
          : existingCase.purposeOfHearingStage || "",
      notes: notes || "",
      caseType: caseType || "",
      status: status || "pending",
      filingDate: filingDate || "",
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
