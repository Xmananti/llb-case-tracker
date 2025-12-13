import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../lib/firebase/config";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  organizationId: z.string().optional(), // Optional for now, can be set during onboarding
  role: z
    .enum(["owner", "admin", "lawyer", "assistant", "viewer"])
    .default("lawyer"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parse = registerSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name, organizationId, role } = parse.data;

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
        organizationId: organizationId || "",
        role: role || "lawyer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userRef = adminDb.ref(`users/${userCred.user.uid}`);
      await userRef.set(userData);

      // If organizationId provided, increment user count
      if (organizationId) {
        const orgRef = adminDb.ref(`organizations/${organizationId}`);
        const orgSnapshot = await orgRef.once("value");
        const orgData = orgSnapshot.val();

        if (orgData) {
          const currentUsers = orgData.currentUsers || 0;
          const maxUsers = orgData.maxUsers || 1;

          // Check if organization has reached user limit
          if (maxUsers > 0 && currentUsers >= maxUsers) {
            return NextResponse.json(
              { error: "Organization has reached maximum user limit" },
              { status: 400 }
            );
          }

          await orgRef.update({
            currentUsers: currentUsers + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }

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
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
