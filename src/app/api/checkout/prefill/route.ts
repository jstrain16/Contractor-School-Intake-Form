import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return NextResponse.json({
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
  });
}

