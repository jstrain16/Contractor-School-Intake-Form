"use server"

import { getSupabaseServerClient } from "@/lib/supabase-server"
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

  const step0 = newData.step0 ?? {}
  const step4 = newData.step4 ?? {}

  const updates = {
    data: newData,
    primary_trade: (step4 as any).primaryTrade ?? null,
    license_type: (step0 as any).licenseType ?? null,
    has_employees: (step0 as any).hasEmployees ?? null,
    qualifier_dob: (step4 as any).qualifierDob ?? null,
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

