import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { INCIDENT_CATEGORY, recomputeSupportingMaterialsPlan } from "@/lib/supporting-materials"

const createSchema = z.object({
  applicationId: z.string().uuid(),
  category: z.enum(Object.values(INCIDENT_CATEGORY) as [string, ...string[]]),
  subtype: z.string().nullable().optional(),
  jurisdiction: z.string().nullable().optional(),
  agency: z.string().nullable().optional(),
  court: z.string().nullable().optional(),
  caseNumber: z.string().nullable().optional(),
  incidentDate: z.string().nullable().optional(),
  resolutionDate: z.string().nullable().optional(),
  source: z.enum(["user_added", "questionnaire"]).optional(),
  sourceKey: z.string().nullable().optional(),
})

async function assertOwnership(supabase: ReturnType<typeof getSupabaseAdminClient>, applicationId: string, userId: string) {
  const { data, error } = await supabase.from("contractor_applications").select("id").eq("id", applicationId).eq("user_id", userId).maybeSingle()
  if (error) throw error
  return !!data
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = createSchema.parse(body)

    const supabase = getSupabaseAdminClient()
    const owns = await assertOwnership(supabase, parsed.applicationId, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const payload = {
      application_id: parsed.applicationId,
      category: parsed.category,
      subtype: parsed.subtype ?? null,
      jurisdiction: parsed.jurisdiction ?? null,
      agency: parsed.agency ?? null,
      court: parsed.court ?? null,
      case_number: parsed.caseNumber ?? null,
      incident_date: parsed.incidentDate ?? null,
      resolution_date: parsed.resolutionDate ?? null,
      is_active: true,
      source: parsed.source ?? "user_added",
      source_key: parsed.sourceKey ?? null,
    }

    const { data, error } = await supabase.from("incidents").insert(payload).select().single()
    if (error) {
      console.error("incident insert error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    await recomputeSupportingMaterialsPlan(parsed.applicationId, {})

    return NextResponse.json({ incident: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("POST /api/incidents error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

