import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { z } from "zod";
import { SUBSCRIPTION_PLANS } from "../../../../lib/types/organization";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  domain: z.string().optional(),
  subscriptionPlan: z
    .enum(["free", "starter", "professional", "enterprise"])
    .default("free"),
  createdBy: z.string(), // Admin user ID
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = organizationSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, address, domain, subscriptionPlan, createdBy } =
      parse.data;

    const plan = SUBSCRIPTION_PLANS[subscriptionPlan];
    const now = new Date();
    const trialEndDate =
      plan.trialDays > 0
        ? new Date(
            now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000
          ).toISOString()
        : null;

    // Build organization data, omitting undefined values (Firebase doesn't accept undefined)
    const organizationData: any = {
      name,
      email,
      phone: phone || "",
      address: address || "",
      domain: domain || "",
      subscriptionPlan,
      subscriptionStatus: plan.trialDays > 0 ? "trial" : "active",
      subscriptionStartDate: now.toISOString(),
      maxUsers: plan.maxUsers,
      maxCases: plan.maxCases,
      currentUsers: 0,
      currentCases: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy,
    };

    // Only include optional date fields if they have values
    if (trialEndDate) {
      organizationData.trialEndDate = trialEndDate;
    }
    // subscriptionEndDate is not set initially (can be added later when subscription ends)

    const orgsRef = adminDb.ref("organizations");
    const newOrgRef = orgsRef.push();
    await newOrgRef.set(organizationData);

    return NextResponse.json(
      {
        id: newOrgRef.key,
        ...organizationData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
