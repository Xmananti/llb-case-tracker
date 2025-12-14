import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const casesRef = adminDb.ref("cases");
    const snapshot = await casesRef.once("value");
    const cases = snapshot.val() || {};

    // Filter cases by userId only
    let filteredCases = Object.entries(cases)
      .filter(([_, caseData]: [string, any]) => {
        return caseData.userId === userId;
      })
      .map(([id, caseData]: [string, any]) => ({
        id,
        ...caseData,
      }));

    return NextResponse.json(filteredCases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
