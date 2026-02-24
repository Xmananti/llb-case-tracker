import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../lib/firebase/admin";

/**
 * POST /api/auth/admin-reset-password
 * Sets a specific user's password. Caller must be authenticated and have role "owner" or "admin".
 * Body: { email: string, newPassword: string }
 * Header: Authorization: Bearer <firebaseIdToken>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid Authorization header." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify caller and get uid
    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerUid = decoded.uid;

    // Check caller role (owner or admin only)
    const callerRef = adminDb.ref(`users/${callerUid}`);
    const callerSnap = await callerRef.once("value");
    const callerData = callerSnap.val();
    const role = callerData?.role;
    if (role !== "owner" && role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only owners and admins can reset user passwords." },
        { status: 403 }
      );
    }

    // Resolve email to user and update password
    const targetUser = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(targetUser.uid, { password: newPassword });

    return NextResponse.json({
      success: true,
      message: "Password has been reset for the user.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("auth/user-not-found") || message.includes("no user record")) {
      return NextResponse.json(
        { error: "No user found with this email." },
        { status: 404 }
      );
    }
    if (message.includes("auth/invalid-email")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }
    if (message.includes("password is too weak") || message.includes("WEAK_PASSWORD")) {
      return NextResponse.json(
        { error: "Password is too weak. Use at least 6 characters." },
        { status: 400 }
      );
    }
    if (message.includes("id token") || message.includes("decoding") || message.includes("expired")) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }

    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
