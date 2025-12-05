import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { WizardData } from "@/lib/schemas"

const EMPTY_DATA: WizardData = {
  step0: {} as any,
  step1: {} as any,
  step2: {} as any,
  step3: {} as any,
  step4: {} as any,
  step5: {} as any,
  step6: {} as any,
  step7: {} as any,
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { userId: clerkUserId } = await clerkAuth()
    const userId = clerkUserId || process.env.DEV_FALLBACK_USER_ID || null
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: existing, error: selectError } = await supabase
      .from("contractor_applications")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Supabase GET error", selectError)
      return NextResponse.json({ error: "Server error", detail: selectError.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ data: existing.data ?? null, applicationId: existing.id })
    }

    // create new
    const { data: created, error: insertError } = await supabase
      .from("contractor_applications")
      .insert({ user_id: userId, data: EMPTY_DATA })
      .select()
      .single()

    if (insertError) {
      console.error("Supabase insert error", insertError)
      return NextResponse.json({ error: "Server error", detail: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data: created.data ?? null, applicationId: created.id })
  } catch (err) {
    console.error("GET /api/wizard error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { userId: clerkUserId } = await clerkAuth()
    const userId = clerkUserId || process.env.DEV_FALLBACK_USER_ID || null
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const data = (body?.data ?? {}) as Partial<WizardData>
    const applicationId = (body?.applicationId as string | null) ?? null

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 })
    }

    const step0 = data.step0 ?? {}
    const step4 = data.step4 ?? {}

    const updates = {
      data,
      primary_trade: (step4 as any).primaryTrade ?? null,
      license_type: (step0 as any).licenseType ?? null,
      has_employees: (step0 as any).hasEmployees ?? null,
      qualifier_dob: (step4 as any).qualifierDob ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("contractor_applications")
      .update(updates)
      .eq("id", applicationId)
      .eq("user_id", userId)

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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createClient(url, serviceKey)
}

