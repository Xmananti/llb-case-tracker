import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";
import { z } from "zod";

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 });
  }

  try {
    const clientRef = adminDb.ref(`clients/${clientId}`);
    const snapshot = await clientRef.once("value");
    const clientData = snapshot.val();

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ id: clientId, ...clientData });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 });
  }

  const body = await req.json();
  const parse = updateClientSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const clientRef = adminDb.ref(`clients/${clientId}`);
    const snapshot = await clientRef.once("value");
    const clientData = snapshot.val();

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updates = {
      ...parse.data,
      updatedAt: new Date().toISOString(),
    };

    await clientRef.update(updates);

    return NextResponse.json({
      id: clientId,
      ...clientData,
      ...updates,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 });
  }

  try {
    const clientRef = adminDb.ref(`clients/${clientId}`);
    const snapshot = await clientRef.once("value");
    const clientData = snapshot.val();

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete all payments for this client
    const paymentsRef = adminDb.ref(`payments`);
    const paymentsSnapshot = await paymentsRef.once("value");
    const payments = paymentsSnapshot.val() || {};

    const deletePromises = Object.entries(payments)
      .filter(([_, payment]: [string, any]) => payment.clientId === clientId)
      .map(([paymentId]) => {
        const paymentRef = adminDb.ref(`payments/${paymentId}`);
        return paymentRef.remove();
      });

    await Promise.all(deletePromises);

    // Delete the client
    await clientRef.remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
