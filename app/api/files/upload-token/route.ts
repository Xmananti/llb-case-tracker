import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime
export const runtime = "nodejs";

/**
 * Securely provides a Blob token for direct client-side uploads
 * This allows large files (>1MB) to bypass Next.js body size limits
 *
 * SECURITY NOTE: This endpoint exposes the Blob token to authenticated clients.
 * Consider implementing additional rate limiting and request validation in production.
 */
export async function POST(request: NextRequest) {
  try {
    // Check for Blob token
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN is not set. Please configure Vercel Blob Storage.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { path, userId } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Valid path is required" },
        { status: 400 }
      );
    }

    // Validate path format (prevent path traversal attacks)
    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid path format" },
        { status: 400 }
      );
    }

    // Ensure path is scoped to cases or users (security check)
    if (!path.startsWith("cases/") && !path.startsWith("users/")) {
      return NextResponse.json(
        { error: "Path must be scoped to cases or users" },
        { status: 400 }
      );
    }

    // Note: userId validation is optional for case-scoped paths
    // In production, add proper user authentication middleware here

    // Return token for direct client-side upload
    return NextResponse.json({
      token,
      path,
    });
  } catch (error) {
    console.error("Error generating upload token:", error);
    return NextResponse.json(
      { error: "Failed to generate upload token" },
      { status: 500 }
    );
  }
}
