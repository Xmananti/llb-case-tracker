import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../lib/firebase/config";
import { adminDb } from "../../../../lib/firebase/admin";

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

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
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Store user data in Realtime Database
    const userData = {
      uid: userCred.user.uid,
      email: userCred.user.email,
      name: name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userRef = adminDb.ref(`users/${userCred.user.uid}`);
    await userRef.set(userData);

    return NextResponse.json({ user: userCred.user }, { status: 201 });
  } catch (error: unknown) {
    let message = "Registration failed";

    if (error instanceof Error) {
      message = error.message;

      // Provide helpful error messages
      if (
        message.includes("API key not valid") ||
        message.includes("INVALID_ARGUMENT")
      ) {
        message =
          "Invalid Firebase API key. Please check your .env.local file. See GET_API_KEY.md for instructions.";
      } else if (message.includes("auth/email-already-in-use")) {
        message = "This email is already registered. Please login instead.";
      } else if (message.includes("auth/weak-password")) {
        message = "Password is too weak. Please use at least 6 characters.";
      } else if (message.includes("auth/invalid-email")) {
        message = "Invalid email address.";
      }
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
