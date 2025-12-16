import { NextResponse } from "next/server"
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server"
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
    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() || clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const firstName = clerkUser?.firstName || ""
    const lastName = clerkUser?.lastName || ""
    const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber || ""

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
      const phased = ensurePhases(existing.data ?? {})
      await ensureProfile(supabase, clerkUserId, clerkUser)
      return NextResponse.json({ data: phased, applicationId: existing.id })
    }

    // create new empty application scoped to this user
    const initialData = {
      ...EMPTY_DATA,
      phase1: {
        firstName,
        lastName,
        phone,
        email,
        clerkUserId,
      },
      formData: {
        firstName,
        lastName,
        phone,
        email,
        clerkUserId,
      },
    }
    const { data: created, error: insertError } = await supabase
      .from("contractor_applications")
      .insert({ user_id: clerkUserId, data: initialData })
      .select()
      .single()

    if (insertError) {
      console.error("Supabase insert error", insertError)
      return NextResponse.json({ error: "Server error", detail: insertError.message }, { status: 500 })
    }

    await ensureProfile(supabase, clerkUserId, clerkUser)

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

    const baseFormData = (data as any)?.formData || (prevData as any)?.formData || {}
    const phasesFromPayload = ensurePhases(data)
    const phasesFromPrev = ensurePhases(prevData)
    const mergedData = {
      ...prevData,
      ...data,
      ...phasesFromPrev,
      ...phasesFromPayload,
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

async function ensureProfile(supabase: ReturnType<typeof getSupabaseAdmin>, userId: string, user: any) {
  const email =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() || user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null
  const firstName = user?.firstName || null
  const lastName = user?.lastName || null
  const phone = user?.phoneNumbers?.[0]?.phoneNumber || null
  const lastActive = user?.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : new Date().toISOString()

  const { data: existing, error: existingErr } = await supabase
    .from("user_profiles")
    .select("role")
    .or(`email.eq.${email ?? ""},user_id.eq.${userId}`)
    .maybeSingle()
  if (existingErr) {
    console.error("ensure profile existing lookup failed", existingErr)
  }
  const resolvedRole = existing?.role ?? "applicant"

  await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        clerk_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: resolvedRole,
        last_active_at: lastActive,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
}

function ensurePhases(data: any): any {
  if (!data) return { ...EMPTY_DATA }
  const hasPhases =
    data.phase1 || data.phase2 || data.phase3 || data.phase4 || data.phase5 || data.phase6 || data.phase7 || data.phase8 ||
    data.phase9 || data.phase10 || data.phase11 || data.phase12 || data.phase13 || data.phase14 || data.phase15 ||
    data.phase16 || data.phase17
  if (hasPhases) return data
  const form = data.formData || data.form || {}
  return {
    ...data,
    ...buildPhasesFromFormData(form),
  }
}

function buildPhasesFromFormData(form: any) {
  const f = form || {}
  return {
    phase1: {
      firstName: f.firstName,
      lastName: f.lastName,
      phone: f.phone,
      email: f.email,
      clerkUserId: f.clerkUserId,
    },
    phase2: {
      licenseType: f.licenseType,
      requiresExam: f.requiresExam,
      classType: f.classType,
    },
    phase3: {
      selectedClass: f.selectedClass,
      classPaymentComplete: f.classPaymentComplete,
    },
    phase4: {
      priorDiscipline: f.priorDiscipline,
      pendingCharges: f.pendingCharges,
      misdemeanors: f.misdemeanors,
      felonies: f.felonies,
      judgments: f.judgments,
      bankruptcy: f.bankruptcy,
      riskLevel: f.riskLevel,
      requiredDocs: f.requiredDocs,
      incidents: f.incidents,
      incidentInformationComplete: f.incidentInformationComplete,
    },
    phase5: {
      assistanceLevel: f.assistanceLevel,
      assistancePaymentComplete: f.assistancePaymentComplete,
    },
    phase6: {
      businessStatus: f.businessStatus,
      businessName: f.businessName,
      businessType: f.businessType,
      businessAddress: f.businessAddress,
      businessCity: f.businessCity,
      businessState: f.businessState,
      businessZip: f.businessZip,
      businessPhone: f.businessPhone,
      businessEmail: f.businessEmail,
      feinStatus: f.feinStatus,
      feinNumber: f.feinNumber,
      bankingStatus: f.bankingStatus,
      bankName: f.bankName,
      accountNumber: f.accountNumber,
      routingNumber: f.routingNumber,
      businessDoc: f.businessDoc,
      feinDoc: f.feinDoc,
      bankAccountStatus: f.bankAccountStatus,
      bankDoc: f.bankDoc,
      owners: f.owners,
      hasEmployees: f.hasEmployees,
      needsWorkersComp: f.needsWorkersComp,
      workersCompStatus: f.workersCompStatus,
      wcProvider: f.wcProvider,
      wcPolicyNumber: f.wcPolicyNumber,
      wcExemptionReason: f.wcExemptionReason,
    },
    phase7: {
      qualifierIsApplicant: f.qualifierIsApplicant,
      qualifierName: f.qualifierName,
      qualifierLicense: f.qualifierLicense,
      qualifierInfo: f.qualifierInfo,
      qualifierAffidavit: f.qualifierAffidavit,
    },
    phase8: {
      insuranceNotified: f.insuranceNotified,
      insuranceQuoteReceived: f.insuranceQuoteReceived,
      insurancePaid: f.insurancePaid,
      insuranceAmount: f.insuranceAmount,
      insuranceCOI: f.insuranceCOI,
      insuranceActive: f.insuranceActive,
      certificateOfInsurance: f.certificateOfInsurance,
      liabilityProvider: f.liabilityProvider,
      liabilityPolicyNumber: f.liabilityPolicyNumber,
      liabilityCoverage: f.liabilityCoverage,
    },
    phase9: {
      wcWaiverSubmitted: f.wcWaiverSubmitted,
      wcWaiverDoc: f.wcWaiverDoc,
      wcWaiverDocs: f.wcWaiverDocs,
      needsWorkersComp: f.needsWorkersComp,
      workersCompStatus: f.workersCompStatus,
      wcProvider: f.wcProvider,
      wcPolicyNumber: f.wcPolicyNumber,
      wcExemptionReason: f.wcExemptionReason,
    },
    phase10: {
      classCompleted: f.classCompleted,
      classCompletedDate: f.classCompletedDate,
      educationComplete: f.educationComplete,
    },
    phase11: {
      examStatus: f.examStatus,
      examPassLetter: f.examPassLetter,
      examPassedDate: f.examPassedDate,
    },
    phase12: {
      insuranceActive: f.insuranceActive,
      certificateOfInsurance: f.certificateOfInsurance,
    },
    phase13: {
      wcWaiverSubmitted: f.wcWaiverSubmitted,
      wcWaiverDoc: f.wcWaiverDoc,
    },
    phase14: {
      doplApplicationReady: f.doplApplicationReady,
      bondProvider: f.bondProvider,
      bondAmount: f.bondAmount,
      experienceYears: f.experienceYears,
    },
    phase15: {
      salesforceCaseId: f.salesforceCaseId,
      assignedStaff: f.assignedStaff,
      staffReviewComplete: f.staffReviewComplete,
    },
    phase16: {
      doplSubmissionStatus: f.doplSubmissionStatus,
      doplSubmissionDate: f.doplSubmissionDate,
      dcplApplicationNumber: f.dcplApplicationNumber,
      dcplSubmissionDate: f.dcplSubmissionDate,
    },
    phase17: {
      estimatedApprovalMin: f.estimatedApprovalMin,
      estimatedApprovalMax: f.estimatedApprovalMax,
    },
  }
}

