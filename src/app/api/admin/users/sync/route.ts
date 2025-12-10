import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const SUPER_ADMIN_EMAIL = "jstrain16@gmail.com"

export async function POST() {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const users: Array<{
      id: string
      email?: string
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      createdAt?: number
      lastActiveAt?: number | null
    }> = []

    const client = await clerkClient()
    let offset = 0
    const limit = 100
    while (true) {
      const page = await client.users.getUserList({ limit, offset })
      page.data.forEach((u) => {
        const email =
          u.primaryEmailAddress?.emailAddress?.toLowerCase() ||
          u.emailAddresses?.[0]?.emailAddress?.toLowerCase()
        users.push({
          id: u.id,
          email: email || undefined,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phoneNumbers?.[0]?.phoneNumber || null,
          createdAt: u.createdAt,
          lastActiveAt: u.lastActiveAt,
        })
      })
      if (!page.hasMore) break
      offset += limit
    }

    const upserts = users.map((u) => ({
      user_id: u.id,
      email: u.email,
      first_name: u.firstName || null,
      last_name: u.lastName || null,
      phone: u.phone || null,
      role: u.email === SUPER_ADMIN_EMAIL ? "super_admin" : "applicant",
      created_at: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
      last_active_at: u.lastActiveAt ? new Date(u.lastActiveAt).toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }))

    const { error: upsertErr } = await supabase.from("user_profiles").upsert(upserts, { onConflict: "user_id" })
    if (upsertErr) {
      console.error("sync upsert error", upsertErr)
      return NextResponse.json({ error: "Failed to sync users" }, { status: 500 })
    }

    // Keep admin_users to only super admin
    const { error: deleteAdminsErr } = await supabase.from("admin_users").delete().neq("email", SUPER_ADMIN_EMAIL)
    if (deleteAdminsErr) {
      console.error("admin_users cleanup failed", deleteAdminsErr)
    }

    const { error: upsertAdminErr } = await supabase
      .from("admin_users")
      .upsert(
        {
          email: SUPER_ADMIN_EMAIL,
          role: "super_admin",
        },
        { onConflict: "email" }
      )
    if (upsertAdminErr) {
      console.error("admin_users upsert failed", upsertAdminErr)
    }

    return NextResponse.json({ ok: true, count: users.length })
  } catch (err) {
    console.error("POST /api/admin/users/sync error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

