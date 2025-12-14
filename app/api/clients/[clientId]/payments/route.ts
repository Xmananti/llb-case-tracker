import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.string(),
  method: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string(),
  userId: z.string(),
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
    const paymentsRef = adminDb.ref("payments");
    const snapshot = await paymentsRef.once("value");
    const payments = snapshot.val() || {};

    const clientPayments = Object.entries(payments)
      .filter(([_, payment]: [string, any]) => payment.clientId === clientId)
      .map(([id, payment]: [string, any]) => ({
        id,
        ...payment,
      }))
      .sort((a: any, b: any) => {
        // Sort by date descending (most recent first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    return NextResponse.json(clientPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 });
  }

  const body = await req.json();
  const parse = paymentSchema.safeParse({ ...body, clientId });
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }

  const { amount, date, method, description, userId } = parse.data;

  try {
    // Verify client exists
    const clientRef = adminDb.ref(`clients/${clientId}`);
    const clientSnapshot = await clientRef.once("value");
    const clientData = clientSnapshot.val();

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const paymentsRef = adminDb.ref("payments");
    const newPaymentRef = paymentsRef.push();

    const paymentData = {
      amount,
      date,
      method: method || "",
      description: description || "",
      clientId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newPaymentRef.set(paymentData);

    return NextResponse.json(
      {
        id: newPaymentRef.key,
        ...paymentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
