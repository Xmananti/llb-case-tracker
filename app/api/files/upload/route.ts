import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Use Node.js runtime for larger file uploads (Edge runtime has 4.5MB limit)
export const runtime = "nodejs";
// Increase timeout for large files (default is 10s, max is 300s on Pro plan)
export const maxDuration = 60;

// CORS headers helper
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  // Allow requests from same origin or configured origins
  // In production, you may want to restrict this to specific domains
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
    // Check for Blob token
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN is not set. Please configure Vercel Blob Storage.",
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

    // Check file size (Vercel Blob free tier: 100MB max per file, Pro: 500MB)
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

    // Upload to Vercel Blob Storage
    // Note: For files > 4MB, consider using direct client-side uploads
    // to bypass Next.js body size limits
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
      token, // Use the token from environment variable
    });

    return NextResponse.json(
      {
        url: blob.url,
        path: blob.pathname,
        size: file.size,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    let errorMessage = "Failed to upload file";

    if (error instanceof Error) {
      errorMessage = error.message;
      // Provide more helpful error messages
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
      } else if (error.message.includes("BLOB_READ_WRITE_TOKEN")) {
        errorMessage =
          "Server configuration error: Blob storage token is missing or invalid.";
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
