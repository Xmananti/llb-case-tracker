import { NextRequest, NextResponse } from "next/server";
import { uploadToGcs } from "@/lib/gcs";

// Use Node.js runtime for larger file uploads (Edge runtime has 4.5MB limit)
export const runtime = "nodejs";
// Increase timeout for large files (default is 10s, max is 300s on Pro plan)
export const maxDuration = 60;

// CORS headers helper
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = origin || process.env.ALLOWED_ORIGIN || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials":
      allowedOrigin !== "*" ? "true" : "false",
    "Access-Control-Max-Age": "86400",
  };
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    if (!process.env.GCS_BUCKET) {
      return NextResponse.json(
        {
          error:
            "GCS_BUCKET is not set. Please configure Google Cloud Storage.",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: "No path provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    const maxFileSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB) exceeds the maximum allowed size of 100MB`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { url, path: storedPath } = await uploadToGcs(
      path,
      buffer,
      file.type || undefined
    );

    return NextResponse.json(
      {
        url,
        path: storedPath,
        size: file.size,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    let errorMessage = "Failed to upload file";

    if (error instanceof Error) {
      errorMessage = error.message;
      if (
        error.message.includes("413") ||
        error.message.includes("Payload Too Large") ||
        error.message.includes("body size limit")
      ) {
        errorMessage =
          "File is too large for server upload. Please try uploading files smaller than 4MB, or contact support for larger file uploads.";
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("TIMEOUT")
      ) {
        errorMessage =
          "Upload timed out. Please try again with a smaller file or check your connection.";
      } else if (
        error.message.includes("CORS") ||
        error.message.includes("cors") ||
        error.message.includes("Access-Control")
      ) {
        errorMessage =
          "CORS error: File upload failed due to cross-origin restrictions. Please ensure your domain is properly configured.";
      } else if (error.message.includes("GCS_BUCKET") || error.message.includes("GCS_")) {
        errorMessage =
          "Server configuration error: Google Cloud Storage is not configured.";
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
