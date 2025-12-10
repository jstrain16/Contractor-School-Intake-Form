import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"

export async function GET() {
  try {
    const { isAllowed } = await requireAdminEmail()
    return NextResponse.json({ isAllowed })
  } catch (err) {
    console.error("GET /api/admin/check error", err)
    return NextResponse.json({ isAllowed: false }, { status: 500 })
  }
}

