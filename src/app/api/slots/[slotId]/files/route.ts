import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

async function slotOwnership(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  slotId: string,
  userId: string
) {
  const { data: slot, error: slotError } = await supabase
    .from("required_document_slots")
    .select("incident_id")
    .eq("id", slotId)
    .maybeSingle()
  if (slotError) throw slotError
  if (!slot) return false

  const { data: incident, error: incidentError } = await supabase
    .from("incidents")
    .select("application_id")
    .eq("id", slot.incident_id)
    .maybeSingle()
  if (incidentError) throw incidentError
  if (!incident) return false

  const { data: app } = await supabase
    .from("contractor_applications")
    .select("id")
    .eq("id", incident.application_id)
    .eq("user_id", userId)
    .maybeSingle()
  return !!app
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slotId: string }> }) {
  try {
    const { slotId } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const supabase = getSupabaseAdminClient()
    const owns = await slotOwnership(supabase, slotId, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { data, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("slot_id", slotId)
      .order("version", { ascending: false })
    if (error) {
      console.error("files list error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ files: data ?? [] })
  } catch (err) {
    console.error("GET /api/slots/[slotId]/files error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

