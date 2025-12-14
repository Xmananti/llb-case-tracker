import { NextRequest, NextResponse } from "next/server";
import { ensureUserHasOrganization } from "../../../../lib/utils/default-organization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Await params once at the start
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    // Try to initialize Admin SDK - if it fails, return basic user data
    let adminDb, adminAuth;
    try {
      const adminModule = await import("../../../../lib/firebase/admin");
      adminDb = adminModule.adminDb;
      adminAuth = adminModule.adminAuth;
    } catch (adminError: any) {
      // Admin SDK not initialized (missing env vars) - return basic response
      console.warn(
        "⚠️ Admin SDK not available, returning basic user data:",
        adminError?.message
      );
      return NextResponse.json({
        uid: userId,
        email: null,
        name: undefined,
        firmName: undefined,
        logoUrl: undefined,
        organizationId: undefined,
        role: "lawyer",
      });
    }

    // Try to get user from Firebase Realtime Database
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
        const firebaseUser = await adminAuth.getUser(userId);

        // Ensure user has an organization (assign default if needed)
        let organizationId = "";
        try {
          organizationId = await ensureUserHasOrganization(userId);
        } catch (orgError) {
          console.warn("Could not assign default organization:", orgError);
          // Continue without organization - will be assigned on next request
        }

        // Create basic user record
        const basicUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          firmName: "",
          logoUrl: "",
          organizationId: organizationId,
          role: "lawyer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to database
        try {
          const userRef = adminDb.ref(`users/${userId}`);
          await userRef.set(basicUserData);
        } catch (saveError) {
          console.error("Error saving user to database:", saveError);
        }

        userData = basicUserData;
      } catch (authError) {
        console.error("Error fetching user from Auth:", authError);
        // Return basic user data instead of error
        return NextResponse.json({
          uid: userId,
          email: null,
          name: undefined,
          organizationId: undefined,
          role: "lawyer",
        });
      }
    } else if (!userData.organizationId) {
      // User exists but has no organization - assign default
      try {
        const organizationId = await ensureUserHasOrganization(userId);
        userData.organizationId = organizationId;
        // Update user record
        const userRef = adminDb.ref(`users/${userId}`);
        await userRef.update({
          organizationId: organizationId,
          updatedAt: new Date().toISOString(),
        });
      } catch (orgError) {
        console.warn("Could not assign default organization:", orgError);
        // Continue without organization - will be assigned on next request
      }
    }

    // If user has organization, fetch organization data
    let organization = null;
    if (userData?.organizationId) {
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
    // Return basic user data instead of error to prevent app crash
    // userId is already available from the awaited params above
    return NextResponse.json({
      uid: userId,
      email: null,
      name: undefined,
      firmName: undefined,
      organizationId: undefined,
      role: "lawyer",
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, firmName, logoUrl } = body;

    // Try to initialize Admin SDK
    let adminDb;
    try {
      const adminModule = await import("../../../../lib/firebase/admin");
      adminDb = adminModule.adminDb;
    } catch (adminError: any) {
      return NextResponse.json(
        { error: "Admin SDK not available" },
        { status: 500 }
      );
    }

    // Update user data in Realtime Database
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      updates.name = name;
    }

    if (firmName !== undefined) {
      updates.firmName = firmName;
    }

    if (logoUrl !== undefined) {
      updates.logoUrl = logoUrl;
    }

    const userRef = adminDb.ref(`users/${userId}`);
    await userRef.update(updates);

    // Also update Firestore if it exists
    try {
      const { getFirestore, doc, updateDoc } = await import(
        "firebase/firestore"
      );
      const { app } = await import("../../../../lib/firebase/config");
      const db = getFirestore(app);
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, updates);
    } catch (firestoreError) {
      // Firestore update is optional, continue even if it fails
      console.warn("Could not update Firestore:", firestoreError);
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
