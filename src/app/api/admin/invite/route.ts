import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { isAllowed, email: inviterEmail } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = (await req.json()) as { email?: string; role?: string }
    const email = body.email?.trim().toLowerCase()
    const role = body.role?.trim().toLowerCase() || "admin"

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const { error } = await supabase
      .from("admin_users")
      .upsert({
        email,
        role,
        invited_by: inviterEmail || null,
      })

    if (error) {
      console.error("invite admin upsert error", error)
      return NextResponse.json({ error: "Failed to invite admin" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/admin/invite error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

