import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const createdBy = searchParams.get("createdBy"); // Filter by admin who created

    const orgsRef = adminDb.ref("organizations");
    const snapshot = await orgsRef.once("value");
    const orgs = snapshot.val() || {};

    let organizations = Object.entries(orgs).map(
      ([id, data]: [string, any]) => ({
        id,
        ...data,
      })
    );

    // Filter by creator if provided
    if (createdBy) {
      organizations = organizations.filter(
        (org: any) => org.createdBy === createdBy
      );
    }

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
