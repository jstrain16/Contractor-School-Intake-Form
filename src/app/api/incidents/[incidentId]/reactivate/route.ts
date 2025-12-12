import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

async function incidentOwnedByUser(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  incidentId: string,
  userId: string
) {
  const { data, error } = await supabase.from("incidents").select("application_id").eq("id", incidentId).maybeSingle()
  if (error) throw error
  if (!data) return null
  const { data: app } = await supabase
    .from("contractor_applications")
    .select("id")
    .eq("id", data.application_id)
    .eq("user_id", userId)
    .maybeSingle()
  return app ? data.application_id : null
}

export async function POST(_: Request, { params }: { params: { incidentId: string } }) {
  try {
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const supabase = getSupabaseAdminClient()
    const applicationId = await incidentOwnedByUser(supabase, params.incidentId, userId)
    if (!applicationId) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { error } = await supabase.from("incidents").update({ is_active: true, updated_at: new Date().toISOString() }).eq("id", params.incidentId)
    if (error) {
      console.error("reactivate incident error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/incidents/[incidentId]/reactivate error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

