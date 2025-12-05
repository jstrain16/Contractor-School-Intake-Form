import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("applicationId")
    const step = searchParams.get("step")
    const fileType = searchParams.get("fileType")

    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 })

    let query = supabase
      .from("contractor_attachments")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (step) query = query.eq("step", Number(step))
    if (fileType) query = query.eq("file_type", fileType)

    const { data, error } = await query.limit(5)
    if (error) {
      console.error("attachments GET error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ attachments: data ?? [] })
  } catch (err: unknown) {
    console.error("GET /api/attachments error", err)
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

