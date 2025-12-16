import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
const PHASE_KEYS = [
  "phase1",
  "phase2",
  "phase3",
  "phase4",
  "phase5",
  "phase6",
  "phase7",
  "phase8",
  "phase9",
  "phase10",
  "phase11",
  "phase12",
  "phase13",
  "phase14",
  "phase15",
  "phase16",
  "phase17",
  "formData",
]

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const applicationId = body?.applicationId as string | undefined
    const sectionKey = body?.sectionKey as string | undefined
    const sectionData = body?.data as Record<string, unknown> | undefined
    const markComplete = body?.markComplete as boolean | undefined
    const phaseId = typeof body?.phaseId === "number" ? body.phaseId : undefined
    const progressOverride = typeof body?.progress === "number" ? body.progress : undefined
    const activePhaseOverride = typeof body?.activePhase === "number" ? body.activePhase : undefined
    const statusOverride = (body?.status as string | undefined) ?? undefined
    const licenseType = (body?.licenseType as string | undefined) ?? undefined
    const primaryTrade = (body?.primaryTrade as string | undefined) ?? undefined
    const hasEmployees = body?.hasEmployees === undefined ? undefined : body.hasEmployees
    const qualifierDob = (body?.qualifierDob as string | undefined) ?? undefined

    if (!applicationId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    if (sectionKey && !PHASE_KEYS.includes(sectionKey)) {
      return NextResponse.json({ error: "Invalid sectionKey" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: existing, error: selectError } = await supabase
      .from("contractor_applications")
      .select("data,completedPhases:completedPhases,active_phase,progress,status")
      .eq("id", applicationId)
      .single()

    if (selectError || !existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (selectError || !existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const currentData = (existing.data || {}) as Record<string, unknown>
    const updatedData = { ...currentData }

    if (sectionKey) {
      updatedData[sectionKey] = sectionData || {}
    } else if (sectionData) {
      Object.assign(updatedData, sectionData)
    }

    // completed phases
    let completed = Array.isArray((currentData as any).completedPhases)
      ? ([...(currentData as any).completedPhases] as number[])
      : Array.isArray((existing as any).completedPhases)
        ? ([...(existing as any).completedPhases] as number[])
        : []

    if (phaseId) {
      if (markComplete === true && !completed.includes(phaseId)) completed.push(phaseId)
      if (markComplete === false) completed = completed.filter((p) => p !== phaseId)
    }
    updatedData.completedPhases = completed

    const activePhase = activePhaseOverride ?? (existing as any).active_phase ?? 1
    updatedData.active_phase = activePhase

    const progress =
      progressOverride ??
      (existing as any).progress ??
      (completed.length > 0 ? Math.round((completed.length / 17) * 100) : 0)
    updatedData.progress = progress

    const resolvedStatus =
      statusOverride ?? (progress >= 100 ? "complete" : progress > 0 || completed.length > 0 ? "in_progress" : "draft")

    const updates: Record<string, unknown> = {
      data: updatedData,
      status: resolvedStatus,
      updated_at: new Date().toISOString(),
    }
    if (typeof activePhase === "number") updates.active_phase = activePhase
    if (typeof progress === "number") updates.progress = progress
    if (licenseType !== undefined) updates.license_type = licenseType
    if (primaryTrade !== undefined) updates.primary_trade = primaryTrade
    if (hasEmployees !== undefined) updates.has_employees = hasEmployees
    if (qualifierDob !== undefined) updates.qualifier_dob = qualifierDob

    const { error: updateError } = await supabase.from("contractor_applications").update(updates).eq("id", applicationId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: updatedData, completedPhases: completed, progress, status: resolvedStatus })
  } catch (err: unknown) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

