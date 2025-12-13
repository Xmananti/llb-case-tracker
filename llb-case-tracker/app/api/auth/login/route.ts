import { NextRequest, NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../lib/firebase/config";
import { adminDb } from "../../../../lib/firebase/admin";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Validate input
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check if Firebase is properly configured
  if (
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("your-") ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("REPLACE")
  ) {
    return NextResponse.json(
      {
        error:
          "Firebase API key not configured. Please set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local. See GET_API_KEY.md for instructions.",
      },
      { status: 500 }
    );
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    // Update last login time in Realtime Database
    const userRef = adminDb.ref(`users/${userCred.user.uid}`);
    await userRef.update({
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ user: userCred.user }, { status: 200 });
  } catch (error: unknown) {
    let message = "Login failed";

    if (error instanceof Error) {
      message = error.message;

      // Provide helpful error messages
      if (
        message.includes("API key not valid") ||
        message.includes("INVALID_ARGUMENT")
      ) {
        message =
          "Invalid Firebase API key. Please check your .env.local file. See GET_API_KEY.md for instructions.";
      } else if (message.includes("auth/user-not-found")) {
        message = "No account found with this email. Please register first.";
      } else if (message.includes("auth/wrong-password")) {
        message = "Incorrect password. Please try again.";
      } else if (message.includes("auth/invalid-email")) {
        message = "Invalid email address.";
      }
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
