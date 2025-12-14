import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const organizationId = req.nextUrl.searchParams.get("organizationId");

  if (!userId && !organizationId) {
    return NextResponse.json(
      { error: "userId or organizationId required" },
      { status: 400 }
    );
  }

  try {
    // If organizationId provided, get user's organization first to verify access
    let userOrgId = organizationId;

    if (userId && !organizationId) {
      // Get user's organization
      try {
        const userRef = adminDb.ref(`users/${userId}`);
        const userSnapshot = await userRef.once("value");
        const userData = userSnapshot.val();

        if (!userData) {
          // User doesn't exist in database yet - return empty array
          return NextResponse.json([]);
        }

        userOrgId = userData.organizationId;
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        return NextResponse.json([]);
      }
    }

    const clientsRef = adminDb.ref("clients");
    const snapshot = await clientsRef.once("value");
    const clients = snapshot.val() || {};

    // Filter clients by organizationId (multi-tenancy)
    let filteredClients = Object.entries(clients)
      .filter(([_, clientData]: [string, any]) => {
        // First, filter by userId (must belong to this user)
        if (userId && clientData.userId !== userId) {
          return false;
        }

        // If user has organizationId
        if (userOrgId) {
          // Show clients that:
          // 1. Have matching organizationId (new multi-tenant clients)
          // 2. OR don't have organizationId but belong to this user (legacy clients)
          if (clientData.organizationId) {
            return clientData.organizationId === userOrgId;
          } else {
            // Legacy client without organizationId - show it if it belongs to this user
            return true;
          }
        } else {
          // User has no organization - show only legacy clients (without organizationId)
          // that belong to this user
          if (clientData.organizationId) {
            return false;
          }
          return true;
        }
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
