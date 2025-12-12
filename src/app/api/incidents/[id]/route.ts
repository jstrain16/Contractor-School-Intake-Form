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
  notes: z.string().nullable().optional(),
})

async function assertOwnership(
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
  if (!data?.application_id) return false

  const { data: app, error: appErr } = await supabase
    .from("contractor_applications")
    .select("id")
    .eq("id", data.application_id)
    .eq("user_id", userId)
    .maybeSingle()
  if (appErr) throw appErr
  return !!app
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = updateSchema.parse(body)

    const supabase = getSupabaseAdminClient()
    const owns = await assertOwnership(supabase, id, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { error, data } = await supabase
      .from("incidents")
      .update({
        jurisdiction: parsed.jurisdiction ?? null,
        agency: parsed.agency ?? null,
        court: parsed.court ?? null,
        case_number: parsed.caseNumber ?? null,
        incident_date: parsed.incidentDate ?? null,
        resolution_date: parsed.resolutionDate ?? null,
        notes: parsed.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle()

    if (error) {
      console.error("incident update error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ incident: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("PATCH /api/incidents/[id] error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

