import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = (await req.json()) as { applicationIds: string[]; adminId: string }
    const { applicationIds, adminId } = body

    if (!adminId || !applicationIds || applicationIds.length === 0) {
      return NextResponse.json({ error: "Missing adminId or applicationIds" }, { status: 400 })
    }

    // Look up admin email for display
    const { data: adminProfile, error: adminErr } = await supabase
      .from("user_profiles")
      .select("id,email,user_id,clerk_id")
      .or(`id.eq.${adminId},user_id.eq.${adminId},clerk_id.eq.${adminId}`)
      .limit(1)
      .maybeSingle()

    if (adminErr || !adminProfile) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Update applications with assigned admin
    const { data: appRows, error: appsErr } = await supabase
      .from("contractor_applications")
      .select("id,user_id")
      .in("id", applicationIds)

    if (appsErr) {
      console.error("assign lookup error", appsErr)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    const { error: updateErr } = await supabase
      .from("contractor_applications")
      .update({
        assigned_admin_id: adminProfile.id,
        assigned_admin_email: adminProfile.email,
        updated_at: new Date().toISOString(),
      })
      .in("id", applicationIds)

    if (updateErr) {
      console.error("assign update error", updateErr)
      return NextResponse.json({ error: "Failed to assign" }, { status: 500 })
    }

    // Sync assigned admin on user profiles for all affected applicants
    const userIds = Array.from(new Set((appRows || []).map((a) => a.user_id).filter(Boolean)))
    if (userIds.length > 0) {
      const profileUpdates = userIds.map((userId) => ({
        user_id: userId,
        assigned_admin_id: adminProfile.id,
        assigned_admin_email: adminProfile.email,
        updated_at: new Date().toISOString(),
      }))
      const { error: profileErr } = await supabase
        .from("user_profiles")
        .upsert(profileUpdates, { onConflict: "user_id" })

      if (profileErr) {
        console.error("assign profile sync error", profileErr)
        return NextResponse.json({ error: "Failed to sync user profiles" }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, assigned_admin_email: adminProfile.email, assigned_admin_id: adminProfile.id })
  } catch (err) {
    console.error("POST /api/admin/applications/assign error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

