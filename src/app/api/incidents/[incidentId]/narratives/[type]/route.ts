import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const updateSchema = z.object({
  content: z.string().default(""),
  autosaveVersion: z.number().int().positive().default(1),
})

const allowedTypes = ["PERSONAL_STATEMENT", "CAUSE_AND_RECOVERY"] as const

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

export async function PUT(req: NextRequest, ctx: { params: Promise<{ incidentId: string; type: string }> }) {
  try {
    const { incidentId, type } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const narrativeType = type
    if (!allowedTypes.includes(narrativeType as (typeof allowedTypes)[number])) {
      return NextResponse.json({ error: "Invalid narrative type" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateSchema.parse(body)

    const supabase = getSupabaseAdminClient()
    const applicationId = await incidentOwnedByUser(supabase, incidentId, userId)
    if (!applicationId) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const payload = {
      incident_id: incidentId,
      type: narrativeType,
      content: parsed.content,
      autosave_version: parsed.autosaveVersion,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("narratives").upsert(payload, { onConflict: "incident_id,type" })
    if (error) {
      console.error("narrative upsert error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("PUT /api/incidents/[incidentId]/narratives/[type] error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

