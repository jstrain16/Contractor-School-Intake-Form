import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

type Body = {
  userId?: string
  active?: boolean
}

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as Body
    const userId = body.userId
    const active = body.active
    if (!userId || typeof active !== "boolean") {
      return NextResponse.json({ error: "Missing userId or active" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
      .from("user_profiles")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (error) {
      console.error("status update failed", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/admin/users/status error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

