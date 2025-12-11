import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { WizardData, Step0Data, Step4Data } from "@/lib/schemas"
import { buildStatus } from "@/lib/progress"

// Default data for a brand-new application; keep licenseType unset so progress starts at 0.
const EMPTY_DATA: Partial<WizardData> = {
  step0: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    preferredContact: "email",
    licenseType: undefined,
    trade: "",
    hasEmployees: false,
    employeeCount: undefined,
    generalLicenses: [],
    specialtyLicenses: [],
  } as Step0Data,
  step1: {
    preLicensureCompleted: false,
    courseProvider: "",
    dateCompleted: "",
    certificateNumber: "",
    exemptions: [],
    certificateFile: null as unknown as File,
    degreeFile: null as unknown as File,
  },
  step2: {
    hasEntityRegistered: false,
    legalBusinessName: "",
    entityType: undefined,
    stateOfIncorporation: "",
    utahEntityNumber: "",
    dateRegistered: "",
    businessPhone: "",
    businessEmail: "",
    physicalAddress: { street: "", city: "", state: "", zip: "" },
    mailingAddressSame: false,
    mailingAddress: { street: "", city: "", state: "", zip: "" },
    hasEin: false,
    federalEin: "",
    hasBusinessBankAccount: false,
  },
  step3: {
    hasGlInsurance: false,
    hasWorkersComp: false,
    hasWcWaiver: false,
    contactInsurancePartner: false,
    insuranceContactRequested: false,
  },
  step4: {
    qualifierDob: "",
    hasExperience: false,
    experienceEntries: [],
    wantsInsuranceQuote: false,
  },
  step5: {
    examStatus: "not_scheduled",
  },
  step6: {
    doplAppCompleted: false,
    reviewRequested: false,
  },
  step7: {
    attested: true,
    signature: "",
    signatureDate: "",
  },
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
    const data = (body?.data ?? {}) as Partial<WizardData>
    const applicationId = (body?.applicationId as string | null) ?? null

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 })
    }

    const step0 = (data.step0 ?? {}) as Partial<Step0Data>
    const step4 = (data.step4 ?? {}) as Partial<Step4Data>

    const cleanDate = (value?: string | null) => {
      if (!value) return null
      const trimmed = value.trim()
      return trimmed.length === 0 ? null : trimmed
    }

    const updates = {
      data: {
        ...data,
        step1: {
          ...(data.step1 || {}),
          dateCompleted: cleanDate(data.step1?.dateCompleted),
        },
        step2: {
          ...(data.step2 || {}),
          dateRegistered: cleanDate(data.step2?.dateRegistered),
        },
        step3: {
          ...(data.step3 || {}),
          glEffectiveDate: cleanDate(data.step3?.glEffectiveDate),
          glExpirationDate: cleanDate(data.step3?.glExpirationDate),
          wcEffectiveDate: cleanDate(data.step3?.wcEffectiveDate),
          wcExpirationDate: cleanDate(data.step3?.wcExpirationDate),
        },
        step4: {
          ...(data.step4 || {}),
          qualifierDob: cleanDate(data.step4?.qualifierDob),
          experienceEntries: (data.step4?.experienceEntries || []).map((entry) => ({
            ...entry,
            startDate: cleanDate(entry.startDate) || "",
            endDate: cleanDate(entry.endDate) || "",
          })),
        },
        step5: {
          ...(data.step5 || {}),
          examDate: cleanDate(data.step5?.examDate),
          examPassedDate: cleanDate(data.step5?.examPassedDate),
        },
        step7: {
          ...(data.step7 || {}),
          signatureDate: cleanDate(data.step7?.signatureDate),
        },
      },
      primary_trade: step4.primaryTrade ?? null,
      license_type: step0.licenseType ?? null,
      has_employees: step0.hasEmployees ?? null,
      qualifier_dob: cleanDate(step4.qualifierDob),
      updated_at: new Date().toISOString(),
    }

    // fetch existing progress for milestone checks
    const { data: existing } = await supabase.from("contractor_applications").select("data").eq("id", applicationId).maybeSingle()
    const prevProgress = buildStatus(existing?.data ?? null).progress
    const newProgress = buildStatus(updates.data as Partial<WizardData>).progress

    const { error } = await supabase
      .from("contractor_applications")
      .update(updates)
      .eq("id", applicationId)
      .eq("user_id", clerkUserId)

    if (error) {
      console.error("Supabase POST error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    // notify admins on milestones crossed (25,50,75,100)
    const milestones = [25, 50, 75, 100]
    const crossed = milestones.find((m) => prevProgress < m && newProgress >= m)
    if (crossed !== undefined) {
      const applicantName = await getApplicantDisplayName(supabase, clerkUserId)
      const adminProfiles = await getAdminProfileIds(supabase)
      if (adminProfiles.length > 0) {
        const notifRows = adminProfiles.map((pid) => ({
          recipient_id: pid,
          title: `Application reached ${crossed}%`,
          message: applicantName
            ? `${applicantName} progressed to ${crossed}%`
            : `Application progressed to ${crossed}%`,
          type: "milestone",
          link: `/admin/application?id=${applicationId}`,
          read: false,
          created_at: new Date().toISOString(),
        }))
        await supabase.from("notifications").insert(notifRows)
      }
    }

    return NextResponse.json({ ok: true })
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

