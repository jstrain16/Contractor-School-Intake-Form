import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    let userId: string | null = null
    try {
      const authData = await auth()
      userId = authData.userId
    } catch (e) {
      console.warn("Auth error on GET /api/wizard, falling back to dev user", e)
    }
    userId = userId || process.env.DEV_FALLBACK_USER_ID || "dev-local"
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("wizard_responses")
      .select("data")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Supabase GET error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data?.data ?? null })
  } catch (err) {
    console.error("GET /api/wizard error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    let userId: string | null = null
    try {
      const authData = await auth()
      userId = authData.userId
    } catch (e) {
      console.warn("Auth error on POST /api/wizard, falling back to dev user", e)
    }
    userId = userId || process.env.DEV_FALLBACK_USER_ID || "dev-local"
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = body?.data ?? {}

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("wizard_responses")
      .upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )

    if (error) {
      console.error("Supabase POST error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("POST /api/wizard error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !serviceKey) {
    throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)")
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

