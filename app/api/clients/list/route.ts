import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const clientsRef = adminDb.ref("clients");
    const snapshot = await clientsRef.once("value");
    const clients = snapshot.val() || {};

    // Filter clients by userId only
    let filteredClients = Object.entries(clients)
      .filter(([_, clientData]: [string, any]) => {
        return clientData.userId === userId;
      })
      .map(([id, clientData]: [string, any]) => ({
        id,
        ...clientData,
      }));

    return NextResponse.json(filteredClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
