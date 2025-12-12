import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

async function assertOwnership(supabase: ReturnType<typeof getSupabaseAdminClient>, applicationId: string, userId: string) {
  const { data, error } = await supabase.from("contractor_applications").select("id").eq("id", applicationId).eq("user_id", userId).maybeSingle()
  if (error) throw error
  return !!data
}

export async function GET(_: Request, { params }: { params: { applicationId: string } }) {
  try {
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const applicationId = params.applicationId
    const supabase = getSupabaseAdminClient()

    const owns = await assertOwnership(supabase, applicationId, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const planRes = await supabase.from("supporting_materials_plan").select("*").eq("application_id", applicationId).maybeSingle()
    if (planRes.error && planRes.error.code !== "PGRST116") throw planRes.error

    const incidentsRes = await supabase.from("incidents").select("*").eq("application_id", applicationId).eq("is_active", true)
    if (incidentsRes.error) throw incidentsRes.error

    const incidentIds = incidentsRes.data?.map((i) => i.id) ?? []
    let slots = []
    let narratives = []
    if (incidentIds.length > 0) {
      const slotsQuery = await supabase.from("required_document_slots").select("*").in("incident_id", incidentIds)
      if (slotsQuery.error) throw slotsQuery.error
      slots = slotsQuery.data ?? []

      const narrativesQuery = await supabase.from("narratives").select("*").in("incident_id", incidentIds)
      if (narrativesQuery.error) throw narrativesQuery.error
      narratives = narrativesQuery.data ?? []
    }

    return NextResponse.json({
      plan: planRes.data ?? null,
      incidents: incidentsRes.data ?? [],
      slots,
      narratives,
    })
  } catch (err) {
    console.error("GET /api/supporting-materials/[applicationId] error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

