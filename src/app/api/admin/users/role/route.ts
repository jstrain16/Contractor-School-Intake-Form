import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

type Body = {
  userId?: string
  email?: string
  role?: string
}

const ALLOWED_ROLES = ["super_admin", "admin", "applicant"]

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as Body
    const role = (body.role || "").toLowerCase()
    const userId = body.userId
    const emailInput = body.email?.toLowerCase().trim()

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // get email from profile if not provided
    let email = emailInput
    if (!email) {
      const { data: profile, error: profErr } = await supabase
        .from("user_profiles")
        .select("email")
        .or(`user_id.eq.${userId},clerk_id.eq.${userId}`)
        .maybeSingle()
      if (profErr) {
        console.error("profile lookup failed", profErr)
        return NextResponse.json({ error: "Failed to lookup profile" }, { status: 500 })
      }
      email = profile?.email?.toLowerCase().trim() || undefined
    }

    const { error: upsertErr, data: profileData } = await supabase
      .from("user_profiles")
      .upsert({ user_id: userId, clerk_id: userId, email, role, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select()
      .maybeSingle()

    if (upsertErr) {
      console.error("role update failed", upsertErr)
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }

    // keep admin_users in sync
    if (email) {
      if (role === "admin" || role === "super_admin") {
        const { error: adminErr } = await supabase
          .from("admin_users")
          .upsert({ email, user_id: userId, role }, { onConflict: "email" })
        if (adminErr) {
          console.error("admin_users upsert failed", adminErr)
        }
      } else {
        const { error: delErr } = await supabase.from("admin_users").delete().eq("email", email)
        if (delErr) {
          console.error("admin_users delete failed", delErr)
        }
      }
    }

    return NextResponse.json({ ok: true, profile: profileData })
  } catch (err) {
    console.error("POST /api/admin/users/role error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

