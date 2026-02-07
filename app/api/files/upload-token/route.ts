import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy endpoint: uploads now go through POST /api/files/upload with GCS.
 * This route validates path and returns it so clients can use it when calling the upload API.
 * No client-side token is used with GCS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, userId } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Valid path is required" },
        { status: 400 }
      );
    }

    if (path.includes("..") || path.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid path format" },
        { status: 400 }
      );
    }

    if (!path.startsWith("cases/") && !path.startsWith("users/")) {
      return NextResponse.json(
        { error: "Path must be scoped to cases or users" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      path,
      message:
        "Upload via POST /api/files/upload with FormData (file + path). No client token used with GCS.",
    });
  } catch (error) {
    console.error("Error in upload-token:", error);
    return NextResponse.json(
      { error: "Failed to validate path" },
      { status: 500 }
    );
  }
}
