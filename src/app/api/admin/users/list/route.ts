import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, user_id, clerk_id, email, first_name, last_name, role")
      .in("role", ["admin", "super_admin"])
      .order("first_name", { ascending: true })

    if (error) {
      console.error("list admins error", error)
      return NextResponse.json({ error: "Failed to load admins" }, { status: 500 })
    }

    const admins =
      data?.map((u) => ({
        id: u.id ?? u.user_id ?? u.clerk_id,
        email: u.email,
        name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email || "Unknown",
        role: u.role,
      })) || []

    return NextResponse.json({ admins })
  } catch (err) {
    console.error("GET /api/admin/users/list error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

