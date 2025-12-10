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
      .select("id,email")
      .eq("id", adminId)
      .single()

    if (adminErr || !adminProfile) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const { error: updateErr } = await supabase
      .from("contractor_applications")
      .update({
        assigned_admin_id: adminId,
        assigned_admin_email: adminProfile.email,
        updated_at: new Date().toISOString(),
      })
      .in("id", applicationIds)

    if (updateErr) {
      console.error("assign update error", updateErr)
      return NextResponse.json({ error: "Failed to assign" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, assigned_admin_email: adminProfile.email })
  } catch (err) {
    console.error("POST /api/admin/applications/assign error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

