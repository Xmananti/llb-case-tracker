import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../../lib/firebase/admin";
import { z } from "zod";

const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  method: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
  }

  const body = await req.json();
  const parse = updatePaymentSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const paymentRef = adminDb.ref(`payments/${paymentId}`);
    const snapshot = await paymentRef.once("value");
    const paymentData = snapshot.val();

    if (!paymentData) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updates = {
      ...parse.data,
      updatedAt: new Date().toISOString(),
    };

    await paymentRef.update(updates);

    return NextResponse.json({
      id: paymentId,
      ...paymentData,
      ...updates,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
  }

  try {
    const paymentRef = adminDb.ref(`payments/${paymentId}`);
    const snapshot = await paymentRef.once("value");
    const paymentData = snapshot.val();

    if (!paymentData) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await paymentRef.remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
