import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const BUCKET = "contractor-documents"

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const form = await req.formData()
    const file = form.get("file") as File | null
    const applicationId = String(form.get("applicationId") || "")
    const fileType = String(form.get("fileType") || "admin-upload")
    const phaseKey = String(form.get("phaseKey") || "")
    const fieldKey = String(form.get("fieldKey") || "")

    if (!file || !applicationId) {
      return NextResponse.json({ error: "Missing file or applicationId" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // verify application exists
    const { data: app, error: appError } = await supabase
      .from("contractor_applications")
      .select("id,user_id")
      .eq("id", applicationId)
      .maybeSingle()
    if (appError) return NextResponse.json({ error: appError.message }, { status: 500 })
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 })

    const path = `admin/${applicationId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: attachment, error: insertError } = await supabase
      .from("contractor_attachments")
      .insert({
        application_id: applicationId,
        user_id: app.user_id,
        bucket: BUCKET,
        path,
        file_type: fileType,
        step: null,
        metadata: { originalName: file.name, phaseKey, fieldKey },
      })
      .select()
      .single()

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({
      attachment: {
        id: attachment.id,
        bucket: attachment.bucket,
        path: attachment.path,
        originalName: attachment.metadata?.originalName || file.name,
        fileType: attachment.file_type,
        uploadedAt: attachment.created_at,
      },
    })
  } catch (err: unknown) {
    console.error("admin upload error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

