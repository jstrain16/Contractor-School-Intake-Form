import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const bodySchema = z.object({
  path: z.string(),
  systemFilename: z.string(),
  originalFilename: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  version: z.number().int().positive(),
})

async function slotOwnership(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  slotId: string,
  userId: string
) {
  const { data: slot, error: slotError } = await supabase
    .from("required_document_slots")
    .select("id, incident_id, slot_code")
    .eq("id", slotId)
    .maybeSingle()
  if (slotError) throw slotError
  if (!slot) return null

  const { data: incident, error: incidentError } = await supabase
    .from("incidents")
    .select("id, application_id")
    .eq("id", slot.incident_id)
    .maybeSingle()
  if (incidentError) throw incidentError
  if (!incident) return null

  const { data: app, error: appError } = await supabase
    .from("contractor_applications")
    .select("id, user_id")
    .eq("id", incident.application_id)
    .eq("user_id", userId)
    .maybeSingle()
  if (appError) throw appError
  if (!app) return null

  return { applicationId: app.id as string, incidentId: incident.id as string }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slotId: string }> }) {
  try {
    const { slotId } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = bodySchema.parse(body)
    const supabase = getSupabaseAdminClient()

    const owned = await slotOwnership(supabase, slotId, userId)
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // mark prior active as inactive
    const { data: prior } = await supabase
      .from("uploaded_files")
      .select("id")
      .eq("slot_id", slotId)
      .eq("is_active", true)
    if (prior && prior.length > 0) {
      await supabase
        .from("uploaded_files")
        .update({ is_active: false, replaced_by_file_id: null })
        .in(
          "id",
          prior.map((p) => p.id)
        )
    }

    const insertPayload = {
      slot_id: slotId,
      original_filename: parsed.originalFilename,
      system_filename: parsed.systemFilename,
      version: parsed.version,
      storage_path: parsed.path,
      mime_type: parsed.mimeType ?? null,
      size: parsed.size ?? null,
      is_active: true,
      uploaded_at: new Date().toISOString(),
      uploaded_by_user_id: userId,
    }

    const { data, error } = await supabase.from("uploaded_files").insert(insertPayload).select().single()
    if (error) {
      console.error("complete-upload insert error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    // set replaced_by reference on previously active (now inactive) to the new file
    if (prior && prior.length > 0) {
      await supabase
        .from("uploaded_files")
        .update({ replaced_by_file_id: data.id })
        .in(
          "id",
          prior.map((p) => p.id)
        )
    }

    await supabase
      .from("required_document_slots")
      .update({ status: "uploaded", updated_at: new Date().toISOString() })
      .eq("id", slotId)

    return NextResponse.json({ file: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("POST /api/slots/[slotId]/complete-upload error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

