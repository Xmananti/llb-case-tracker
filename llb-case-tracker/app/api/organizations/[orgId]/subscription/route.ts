import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";
import { SUBSCRIPTION_PLANS } from "../../../../../lib/types/organization";
import { z } from "zod";

const subscriptionUpdateSchema = z.object({
  subscriptionPlan: z.enum(["free", "starter", "professional", "enterprise"]),
  subscriptionStatus: z
    .enum(["active", "trial", "expired", "cancelled"])
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    const parse = subscriptionUpdateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { subscriptionPlan, subscriptionStatus } = parse.data;
    const plan = SUBSCRIPTION_PLANS[subscriptionPlan];

    const orgRef = adminDb.ref(`organizations/${orgId}`);
    const snapshot = await orgRef.once("value");
    const existingData = snapshot.val();

    if (!existingData) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const updateData: any = {
      subscriptionPlan,
      maxUsers: plan.maxUsers,
      maxCases: plan.maxCases,
      updatedAt: now.toISOString(),
    };

    // Handle subscription status
    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    } else if (
      plan.trialDays > 0 &&
      existingData.subscriptionStatus === "trial"
    ) {
      // Keep trial status if already in trial
      updateData.subscriptionStatus = "trial";
      updateData.trialEndDate =
        existingData.trialEndDate ||
        new Date(
          now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000
        ).toISOString();
    } else {
      updateData.subscriptionStatus = "active";
      updateData.subscriptionStartDate = now.toISOString();
    }

    await orgRef.update(updateData);

    return NextResponse.json({
      id: orgId,
      ...existingData,
      ...updateData,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
