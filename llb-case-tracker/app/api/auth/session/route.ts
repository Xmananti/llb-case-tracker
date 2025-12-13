import { NextResponse } from "next/server";
import { auth } from "../../../../lib/firebase/config";

export async function GET() {
  const user = auth.currentUser;
  return NextResponse.json({
    user: user ? JSON.parse(JSON.stringify(user)) : null,
  });
}
