import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Try to get user from Firebase Auth first
    let userData: any = null;

    try {
      const userRef = adminDb.ref(`users/${userId}`);
      const snapshot = await userRef.once("value");
      userData = snapshot.val();
    } catch (dbError) {
      console.error("Error fetching user from database:", dbError);
    }

    // If user doesn't exist in database, try to get from Auth and create basic record
    if (!userData) {
      try {
        const { adminAuth } = await import("../../../../lib/firebase/admin");
        const firebaseUser = await adminAuth.getUser(userId);

        // Create basic user record
        const basicUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          organizationId: "",
          role: "lawyer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to database
        const userRef = adminDb.ref(`users/${userId}`);
        await userRef.set(basicUserData);

        userData = basicUserData;
      } catch (authError) {
        console.error("Error fetching user from Auth:", authError);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // If user has organization, fetch organization data
    let organization = null;
    if (userData.organizationId) {
      try {
        const orgRef = adminDb.ref(`organizations/${userData.organizationId}`);
        const orgSnapshot = await orgRef.once("value");
        organization = orgSnapshot.val();
      } catch (orgError) {
        console.error("Error fetching organization:", orgError);
      }
    }

    return NextResponse.json({
      ...userData,
      organization,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
