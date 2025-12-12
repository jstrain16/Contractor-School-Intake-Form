import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const updateSchema = z.object({
  jurisdiction: z.string().nullable().optional(),
  agency: z.string().nullable().optional(),
  court: z.string().nullable().optional(),
  caseNumber: z.string().nullable().optional(),
  incidentDate: z.string().nullable().optional(),
  resolutionDate: z.string().nullable().optional(),
  subtype: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

async function incidentOwnedByUser(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  incidentId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("incidents")
    .select("application_id")
    .eq("id", incidentId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const { data: app, error: appError } = await supabase
    .from("contractor_applications")
    .select("id")
    .eq("id", data.application_id)
    .eq("user_id", userId)
    .maybeSingle()
  if (appError) throw appError
  return app ? data.application_id : null
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ incidentId: string }> }) {
  try {
    const { incidentId } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = updateSchema.parse(body)

    const supabase = getSupabaseAdminClient()
    const applicationId = await incidentOwnedByUser(supabase, incidentId, userId)
    if (!applicationId) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updates = {
      jurisdiction: parsed.jurisdiction ?? null,
      agency: parsed.agency ?? null,
      court: parsed.court ?? null,
      case_number: parsed.caseNumber ?? null,
      incident_date: parsed.incidentDate ?? null,
      resolution_date: parsed.resolutionDate ?? null,
      subtype: parsed.subtype ?? null,
      notes: parsed.notes ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("incidents").update(updates).eq("id", incidentId)
    if (error) {
      console.error("incident update error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("PATCH /api/incidents/[incidentId] error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

