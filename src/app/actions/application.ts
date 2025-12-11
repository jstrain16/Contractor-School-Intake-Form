"use server"

import { getSupabaseServerClient } from "@/lib/supabase-server"
import { WizardData, Step0Data, Step4Data } from "@/lib/schemas"

// Default data for a brand-new application; keep licenseType unset so progress starts at 0.
const EMPTY_DATA: Partial<WizardData> = {
  step0: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    preferredContact: "email",
    licenseType: undefined,
    generalLicenses: [],
    specialtyLicenses: [],
    trade: "",
    hasEmployees: false,
    employeeCount: undefined,
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
    mailingAddressSame: true,
    hasEin: false,
    hasBusinessBankAccount: false,
  },
  step3: {
    hasGlInsurance: false,
    contactInsurancePartner: false,
    insuranceContactRequested: false,
    hasWorkersComp: false,
    hasWcWaiver: false,
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

export async function getOrCreateApplication() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Not authenticated")

  const { data: existing, error: selectError } = await supabase
    .from("contractor_applications")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (selectError && selectError.code !== "PGRST116") throw selectError
  if (existing) return existing

  const { data: created, error: insertError } = await supabase
    .from("contractor_applications")
    .insert({
      user_id: user.id,
      data: EMPTY_DATA,
    })
    .select()
    .single()

  if (insertError) throw insertError
  return created
}

export async function saveApplicationData(applicationId: string, newData: Partial<WizardData>) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Not authenticated")

  const step0 = (newData.step0 ?? {}) as Partial<Step0Data>
  const step4 = (newData.step4 ?? {}) as Partial<Step4Data>

  const updates = {
    data: newData,
    primary_trade: step4.primaryTrade ?? null,
    license_type: step0.licenseType ?? null,
    has_employees: step0.hasEmployees ?? null,
    qualifier_dob: step4.qualifierDob ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("contractor_applications")
    .update(updates)
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

