import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const caseSchema = z.object({
  title: z.string().min(2, "Case title is required"),
  description: z.string().min(2, "Description is required"),
  plaintiffCase: z.string().optional(),
  defendantCase: z.string().optional(),
  workToBeDone: z.string().optional(),
  caseNumber: z.string().optional(),
  caseCategory: z.string().optional(), // O.S, C.C, S.C, Crl.P, W.P, etc.
  court: z.string().optional(),
  fileNumber: z.string().optional(),
  year: z.string().optional(),
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
  // Store client contact mobile number for quick reference
  mobileNumber: z.string().optional(),
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
    .default("pending"),
  filingDate: z.string().optional(),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Preprocess body to ensure status is valid
  if (body.status === "" || body.status === null || body.status === undefined) {
    body.status = "pending";
  }

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
    plaintiffCase,
    defendantCase,
    workToBeDone,
    caseNumber,
    caseCategory,
    court,
    fileNumber,
    year,
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
  mobileNumber,
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
    // Check if Admin SDK is available
    try {
      // Test if adminDb is accessible
      adminDb.ref("test");
    } catch (adminError) {
      const adminErrorMessage =
        adminError instanceof Error ? adminError.message : String(adminError);
      if (adminErrorMessage.includes("Firebase Admin SDK is not configured")) {
        return NextResponse.json(
          {
            error:
              "Server configuration error: Firebase Admin SDK is not properly configured. Please contact your administrator.",
            details: adminErrorMessage,
          },
          { status: 500 }
        );
      }
      throw adminError;
    }

    const casesRef = adminDb.ref("cases");
    const newCaseRef = casesRef.push();

    const caseData = {
      title,
      description,
      plaintiffCase: plaintiffCase || "",
      defendantCase: defendantCase || "",
      workToBeDone: workToBeDone || "",
      caseNumber: caseNumber || "",
      caseCategory: caseCategory || "",
      court: court || "",
      fileNumber: fileNumber || "",
      year: year || "",
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
      mobileNumber: mobileNumber || "",
      vakalatFiled: vakalatFiled || false,
      currentStage: currentStage || "",
      lastHearingDate: lastHearingDate || "",
      nextHearingDate: nextHearingDate || "",
      hearingPurpose: hearingPurpose || "",
      purposeOfHearingStage: purposeOfHearingStage || "",
      notes: notes || "",
      caseType: caseType || "",
      status:
        status &&
        [
          "pending",
          "admitted",
          "dismissed",
          "allowed",
          "disposed",
          "withdrawn",
          "compromised",
          "stayed",
          "appeal_filed",
        ].includes(status)
          ? status
          : "pending",
      filingDate: filingDate || "",
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
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's an Admin SDK initialization error
    if (errorMessage.includes("Firebase Admin SDK is not configured")) {
      return NextResponse.json(
        {
          error:
            "Server configuration error: Firebase Admin SDK is not properly configured. Please contact your administrator.",
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    // Check if it's a database connection error
    if (
      errorMessage.includes("PERMISSION_DENIED") ||
      errorMessage.includes("permission")
    ) {
      return NextResponse.json(
        {
          error:
            "Permission denied: Unable to access database. Please check your permissions.",
          details: errorMessage,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create case",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
