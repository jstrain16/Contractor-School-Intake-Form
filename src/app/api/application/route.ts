import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

// Default skeleton for V2 phases
const EMPTY_DATA = {
  progress: 0,
  active_phase: 1,
  phase1: {},
  phase2: {},
  phase3: {},
  phase4: {},
  phase5: {},
  phase6: {},
  phase7: {},
  phase8: {},
  phase9: {},
  phase10: {},
  phase11: {},
  phase12: {},
  phase13: {},
  phase14: {},
  phase15: {},
  phase16: {},
  phase17: {},
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { userId: clerkUserId } = await clerkAuth()
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: existing, error: selectError } = await supabase
      .from("contractor_applications")
      .select("*")
      .eq("user_id", clerkUserId)
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Supabase GET error", selectError)
      return NextResponse.json({ error: "Server error", detail: selectError.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ data: existing.data ?? null, applicationId: existing.id })
    }

    // create new empty application scoped to this user
    const { data: created, error: insertError } = await supabase
      .from("contractor_applications")
      .insert({ user_id: clerkUserId, data: EMPTY_DATA })
      .select()
      .single()

    if (insertError) {
      console.error("Supabase insert error", insertError)
      return NextResponse.json({ error: "Server error", detail: insertError.message }, { status: 500 })
    }

    // notify admins of new application (use applicant name instead of UUID)
    const applicantName = await getApplicantDisplayName(supabase, clerkUserId)
    const adminProfiles = await getAdminProfileIds(supabase)
    if (adminProfiles.length > 0) {
      const notifRows = adminProfiles.map((pid) => ({
        recipient_id: pid,
        title: "New application submitted",
        message: applicantName ? `New application from ${applicantName}` : "New application submitted",
        type: "new_application",
        link: `/admin/application?id=${created.id}`,
        read: false,
        created_at: new Date().toISOString(),
      }))
      await supabase.from("notifications").insert(notifRows)
    }

    return NextResponse.json({ data: created.data ?? null, applicationId: created.id })
  } catch (err) {
    console.error("GET /api/application error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { userId: clerkUserId } = await clerkAuth()
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const data = (body?.data ?? {}) as Record<string, unknown>
    const applicationId = (body?.applicationId as string | null) ?? null
    const progress = typeof body?.progress === "number" ? body.progress : undefined
    const activePhase = typeof body?.activePhase === "number" ? body.activePhase : undefined
    const status = (body?.status as string | undefined) ?? undefined
    const licenseType = (body?.licenseType as string | undefined) ?? (data as any)?.licenseType ?? null
    const primaryTrade = (body?.primaryTrade as string | undefined) ?? (data as any)?.primaryTrade ?? null

    // normalize hasEmployees (can arrive as "yes"/"no"/""/boolean)
    const normalizeHasEmployees = (val: unknown) => {
      if (val === true || val === "yes") return true
      if (val === false || val === "no") return false
      return null
    }
    const hasEmployees = normalizeHasEmployees(body?.hasEmployees ?? (data as any)?.hasEmployees)

    // normalize qualifierDob; empty string -> null
    const rawQualifierDob = (body?.qualifierDob as string | undefined) ?? (data as any)?.qualifierDob ?? null
    const qualifierDob = rawQualifierDob && String(rawQualifierDob).trim() !== "" ? rawQualifierDob : null

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 })
    }

    // merge incoming data with existing data to preserve other phases
    const { data: existing, error: selectErr } = await supabase
      .from("contractor_applications")
      .select("data")
      .eq("id", applicationId)
      .eq("user_id", clerkUserId)
      .maybeSingle()

    if (selectErr) {
      console.error("Supabase POST select error", selectErr)
      return NextResponse.json({ error: "Server error", detail: selectErr.message }, { status: 500 })
    }

    const prevData = (existing?.data as Record<string, unknown> | null) ?? {}
    const mergedData = {
      ...prevData,
      ...data,
      progress: progress ?? (prevData as any).progress ?? 0,
      active_phase: activePhase ?? (prevData as any).active_phase ?? 1,
    }

    const resolvedStatus =
      status ??
      (mergedData.progress >= 100 ? "complete" : mergedData.progress > 0 ? "in_progress" : "draft")

    const updates = {
      data: mergedData,
      primary_trade: primaryTrade ?? null,
      license_type: licenseType ?? null,
      has_employees: hasEmployees ?? null,
      qualifier_dob: qualifierDob ?? null,
      status: resolvedStatus,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("contractor_applications")
      .update(updates)
      .eq("id", applicationId)
      .eq("user_id", clerkUserId)

    if (error) {
      console.error("Supabase POST error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: mergedData, applicationId, status: resolvedStatus })
  } catch (err: unknown) {
    console.error("POST /api/application error", err)
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

async function getApplicantDisplayName(supabase: ReturnType<typeof getSupabaseAdmin>, clerkUserId: string) {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name,last_name,email")
    .eq("user_id", clerkUserId)
    .maybeSingle()
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()
  return name || profile?.email || "New applicant"
}

async function getAdminProfileIds(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: admins, error } = await supabase.from("user_profiles").select("id,role")
  if (error) {
    console.error("admin profile fetch error", error)
    return []
  }
  const normalizeRole = (val?: string | null) => {
    const raw = (val || "").toLowerCase().trim().replace(/[\s-]+/g, "_")
    if (raw === "super_admin" || raw === "superadmin") return "super_admin"
    if (raw === "admin") return "admin"
    return ""
  }
  return (admins || [])
    .filter((a) => {
      const r = normalizeRole(a.role)
      return r === "admin" || r === "super_admin"
    })
    .map((a) => a.id)
    .filter(Boolean)
}

