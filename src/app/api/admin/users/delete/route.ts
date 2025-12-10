import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

type Body = {
  userId?: string
}

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as Body
    const userId = body.userId
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Get email to clean admin_users
    const { data: profile, error: profErr } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("user_id", userId)
      .maybeSingle()
    if (profErr) {
      console.error("delete user profile lookup failed", profErr)
    }
    const email = profile?.email

    const { error: delProfileErr } = await supabase.from("user_profiles").delete().eq("user_id", userId)
    if (delProfileErr) {
      console.error("delete user profile failed", delProfileErr)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    if (email) {
      const { error: delAdminErr } = await supabase.from("admin_users").delete().eq("email", email)
      if (delAdminErr) {
        console.error("delete admin_users failed", delAdminErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/admin/users/delete error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

