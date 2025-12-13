import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    const orgRef = adminDb.ref(`organizations/${orgId}`);
    const snapshot = await orgRef.once("value");
    const orgData = snapshot.val();

    if (!orgData) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: orgId,
      ...orgData,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

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

    const orgRef = adminDb.ref(`organizations/${orgId}`);
    const snapshot = await orgRef.once("value");
    const existingData = snapshot.val();

    if (!existingData) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Update only allowed fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    const allowedFields = [
      "name",
      "email",
      "phone",
      "address",
      "domain",
      "logo",
      "subscriptionPlan",
      "subscriptionStatus",
      "subscriptionEndDate",
      "trialEndDate",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    await orgRef.update(updateData);

    return NextResponse.json({
      id: orgId,
      ...existingData,
      ...updateData,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
