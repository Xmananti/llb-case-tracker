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
    const allCases = snapshot.val();

    // Filter cases by userId
    const userCases = allCases
      ? Object.keys(allCases)
          .filter((key) => allCases[key].userId === userId)
          .map((key) => ({
            id: key,
            ...allCases[key],
          }))
      : [];

    return NextResponse.json(userCases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
