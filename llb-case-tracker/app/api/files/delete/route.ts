import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Delete from Vercel Blob Storage
    await del(url, { token });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
