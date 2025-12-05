import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { WizardData } from "@/lib/schemas"

const SECTION_KEYS: Array<keyof WizardData> = ["step0", "step1", "step2", "step3", "step4", "step5", "step6", "step7"]

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const applicationId = body?.applicationId as string | undefined
    const sectionKey = body?.sectionKey as keyof WizardData
    const sectionData = body?.data as Record<string, unknown> | undefined

    if (!applicationId || !sectionKey || !SECTION_KEYS.includes(sectionKey)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: existing, error: selectError } = await supabase
      .from("contractor_applications")
      .select("data")
      .eq("id", applicationId)
      .single()

    if (selectError || !existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const currentData = (existing.data || {}) as WizardData
    const updatedData = {
      ...currentData,
      [sectionKey]: sectionData || {},
    } as WizardData

    const { error: updateError } = await supabase
      .from("contractor_applications")
      .update({ data: updatedData, updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: updatedData })
  } catch (err: unknown) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

