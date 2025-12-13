import { NextResponse } from "next/server";
import { signOut } from "firebase/auth";
import { auth } from "../../../../lib/firebase/config";

export async function POST() {
  await signOut(auth);
  return NextResponse.json({ ok: true });
}
