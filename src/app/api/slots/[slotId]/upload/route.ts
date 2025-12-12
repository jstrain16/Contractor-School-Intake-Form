import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { getStoragePath, getSystemFilename } from "@/lib/supporting-materials"

const bodySchema = z.object({
  filename: z.string(),
  mimeType: z.string().optional(),
})

const bucket = "supporting-materials"

function shortId(prefix: string, id: string) {
  return `${prefix}-${id.slice(0, 4).toUpperCase()}`
}

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

  return { applicationId: app.id as string, incidentId: incident.id as string, slotCode: slot.slot_code as string }
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

    const { data: versionRow, error: versionError } = await supabase
      .from("uploaded_files")
      .select("version")
      .eq("slot_id", slotId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (versionError && versionError.code !== "PGRST116") {
      console.error("version fetch error", versionError)
      return NextResponse.json({ error: "Server error", detail: versionError.message }, { status: 500 })
    }
    const nextVersion = (versionRow?.version ?? 0) + 1

    const ext = parsed.filename.includes(".") ? parsed.filename.split(".").pop() || "dat" : "dat"
    const appShort = shortId("APP", owned.applicationId)
    const incidentShort = shortId("INC", owned.incidentId)
    const systemFilename = getSystemFilename({
      appShortId: appShort,
      incidentShortId: incidentShort,
      slotCode: owned.slotCode,
      version: nextVersion,
      ext,
    })

    const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8)
    const storagePath = getStoragePath({
      userId,
      applicationId: owned.applicationId,
      incidentId: owned.incidentId,
      slotCode: owned.slotCode,
      version: nextVersion,
      ext,
      hash,
    })

    const { data: signed, error: signedError } = await supabase.storage.from(bucket).createSignedUploadUrl(storagePath)
    if (signedError || !signed) {
      console.error("signed upload url error", signedError)
      return NextResponse.json({ error: "Server error", detail: signedError?.message }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: signed.signedUrl,
      path: storagePath,
      systemFilename,
      version: nextVersion,
      slotId,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("POST /api/slots/[slotId]/upload error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

