import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

const BUCKET = "contractor-documents"

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const formData = await req.formData()

    const file = formData.get("file") as File | null
    const step = Number(formData.get("step") ?? 0)
    const fileType = String(formData.get("fileType") ?? "unknown")
    const applicationId = String(formData.get("applicationId") ?? "")

    if (!file || !applicationId) {
      return NextResponse.json({ error: "Missing file or applicationId" }, { status: 400 })
    }

    const { userId: clerkUserId } = await clerkAuth()
    const userId = clerkUserId || process.env.DEV_FALLBACK_USER_ID || null
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify application ownership
    const { data: app, error: appError } = await supabase
      .from("contractor_applications")
      .select("id")
      .eq("id", applicationId)
      .eq("user_id", userId)
      .maybeSingle()

    if (appError) {
      console.error(appError)
      return NextResponse.json({ error: "Application lookup failed" }, { status: 500 })
    }
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const ext = file.name.split(".").pop()
    const path = `${userId}/${applicationId}/${Date.now()}-${file.name}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      console.error(uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Record attachment
    const { data: attachment, error: insertError } = await supabase
      .from("contractor_attachments")
      .insert({
        application_id: applicationId,
        user_id: userId,
        bucket: BUCKET,
        path,
        file_type: fileType,
        step,
        metadata: { originalName: file.name, ext },
      })
      .select()
      .single()

    if (insertError) {
      console.error(insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ attachment })
  } catch (err: any) {
    console.error("upload-attachment error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createClient(url, serviceKey)
}

