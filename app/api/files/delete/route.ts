import { NextRequest, NextResponse } from "next/server";
import { deleteFromGcsByUrl, parseGcsUrl } from "@/lib/gcs";

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.GCS_BUCKET) {
      return NextResponse.json(
        {
          error:
            "GCS_BUCKET is not set. Please configure Google Cloud Storage.",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const parsed = parseGcsUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid or unsupported storage URL. Only GCS URLs can be deleted." },
        { status: 400 }
      );
    }

    await deleteFromGcsByUrl(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
