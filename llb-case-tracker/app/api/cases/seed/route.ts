import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create a sample case with complete data
    const sampleCase = {
      title: "Smith vs. Jones - Contract Dispute",
      description:
        "This is a sample case demonstrating a contract dispute between two parties. The case involves breach of contract allegations and seeks damages for financial losses incurred.",
      caseNumber: "CV-2024-001",
      court: "District Court of New York",
      oppositeParty: "Jones Corporation",
      caseType: "Civil",
      status: "active",
      filingDate: new Date("2024-01-15").toISOString(),
      nextHearingDate: new Date("2024-12-20").toISOString(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const casesRef = adminDb.ref("cases");
    const newCaseRef = casesRef.push();
    await newCaseRef.set(sampleCase);

    return NextResponse.json(
      {
        id: newCaseRef.key,
        ...sampleCase,
        message: "Sample case created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sample case:", error);
    return NextResponse.json(
      { error: "Failed to create sample case" },
      { status: 500 }
    );
  }
}
