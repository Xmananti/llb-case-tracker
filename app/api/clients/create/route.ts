import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = clientSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parse.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, phone, address, notes, userId } = parse.data;

  try {
    const clientsRef = adminDb.ref("clients");
    const newClientRef = clientsRef.push();

    const clientData = {
      name,
      email: email || "",
      phone: phone || "",
      address: address || "",
      notes: notes || "",
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newClientRef.set(clientData);

    return NextResponse.json(
      {
        id: newClientRef.key,
        ...clientData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
