import { NextRequest, NextResponse } from "next/server";
import { getSignedReadUrl, parseGcsUrl } from "@/lib/gcs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Missing url query parameter" },
        { status: 400 }
      );
    }

    if (!parseGcsUrl(url)) {
      return NextResponse.json(
        { error: "Invalid GCS URL" },
        { status: 400 }
      );
    }

    const expiresParam = searchParams.get("expires");
    const expiresInSeconds = expiresParam
      ? Math.min(Math.max(60, parseInt(expiresParam, 10)), 86400)
      : 3600;

    const signedUrl = await getSignedReadUrl(url, expiresInSeconds);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate signed URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
