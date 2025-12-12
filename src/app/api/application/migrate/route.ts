import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const supabase = getSupabaseAdminClient()

    const { data: legacy, error: legacyError } = await supabase
      .from("contractor_applications")
      .select("id, user_id, data")
      .eq("user_id", userId)
      .maybeSingle()
    if (legacyError) {
      console.error("legacy fetch error", legacyError)
      return NextResponse.json({ error: "Server error", detail: legacyError.message }, { status: 500 })
    }
    if (!legacy) return NextResponse.json({ error: "No legacy application found" }, { status: 404 })

    const { data: existing, error: existError } = await supabase
      .from("applications")
      .select("id")
      .eq("id", legacy.id)
      .maybeSingle()
    if (existError && existError.code !== "PGRST116") {
      console.error("existing app check error", existError)
      return NextResponse.json({ error: "Server error", detail: existError.message }, { status: 500 })
    }

    if (!existing) {
      const { error: insertError } = await supabase.from("applications").insert({
        id: legacy.id,
        user_id: userId,
        status: "draft",
        license_classification: legacy.data?.step0?.licenseType ?? null,
        risk_tier: null,
      })
      if (insertError) {
        console.error("applications insert error", insertError)
        return NextResponse.json({ error: "Server error", detail: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, applicationId: legacy.id })
  } catch (err) {
    console.error("POST /api/application/migrate error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

