import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    if (!caseId) {
      return NextResponse.json({ error: "caseId required" }, { status: 400 });
    }

    // Get counts from Realtime Database
    const [documentsSnap, hearingsSnap, tasksSnap, conversationsSnap] =
      await Promise.all([
        adminDb
          .ref(`documents`)
          .orderByChild("caseId")
          .equalTo(caseId)
          .once("value"),
        adminDb
          .ref(`hearings`)
          .orderByChild("caseId")
          .equalTo(caseId)
          .once("value"),
        adminDb
          .ref(`tasks`)
          .orderByChild("caseId")
          .equalTo(caseId)
          .once("value"),
        adminDb
          .ref(`conversations`)
          .orderByChild("caseId")
          .equalTo(caseId)
          .once("value"),
      ]);

    // For Firestore collections, we'll need to query them separately
    // Since documents, hearings, tasks, conversations are in Firestore
    // We'll return 0 for now and fetch from client side

    return NextResponse.json({
      documents: 0, // Will be fetched from Firestore on client
      hearings: 0,
      tasks: 0,
      conversations: 0,
    });
  } catch (error) {
    console.error("Error fetching case stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch case statistics" },
      { status: 500 }
    );
  }
}
