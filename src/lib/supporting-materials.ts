import { getSupabaseAdminClient } from "./supabase-admin"

export const INCIDENT_CATEGORY = {
  BACKGROUND: "BACKGROUND",
  DISCIPLINE: "DISCIPLINE",
  FINANCIAL: "FINANCIAL",
  BANKRUPTCY: "BANKRUPTCY",
} as const

export const BACKGROUND_SUBTYPE = {
  PENDING_CASE: "PENDING_CASE",
  MISDEMEANOR: "MISDEMEANOR",
  FELONY: "FELONY",
  OTHER: "OTHER",
} as const

export const DISCIPLINE_SUBTYPE = {
  DENIAL: "DENIAL",
  SUSPENSION: "SUSPENSION",
  REVOCATION: "REVOCATION",
  PROBATION: "PROBATION",
  OTHER: "OTHER",
} as const

export const FINANCIAL_SUBTYPE = {
  LIEN: "LIEN",
  JUDGMENT: "JUDGMENT",
  CHILD_SUPPORT: "CHILD_SUPPORT",
  OTHER: "OTHER",
} as const

export const BANKRUPTCY_SUBTYPE = {
  CH7: "CH7",
  CH11: "CH11",
  CH13: "CH13",
  UNKNOWN: "UNKNOWN",
} as const

export type SourceKey =
  | "prior_license_discipline"
  | "pending_legal_matters"
  | "misdemeanor_last_10_years"
  | "felony_any_time"
  | "financial_judgments_liens_child_support"
  | "bankruptcy_last_7_years"

const QUESTION_TO_INCIDENT: Record<
  SourceKey,
  {
    category: keyof typeof INCIDENT_CATEGORY
    subtype: string
    uiSection: "PRIOR_LICENSING" | "BACKGROUND" | "FINANCIAL" | "BANKRUPTCY"
  }
> = {
  prior_license_discipline: {
    category: INCIDENT_CATEGORY.DISCIPLINE,
    subtype: DISCIPLINE_SUBTYPE.OTHER,
    uiSection: "PRIOR_LICENSING",
  },
  pending_legal_matters: {
    category: INCIDENT_CATEGORY.BACKGROUND,
    subtype: BACKGROUND_SUBTYPE.PENDING_CASE,
    uiSection: "BACKGROUND",
  },
  misdemeanor_last_10_years: {
    category: INCIDENT_CATEGORY.BACKGROUND,
    subtype: BACKGROUND_SUBTYPE.MISDEMEANOR,
    uiSection: "BACKGROUND",
  },
  felony_any_time: {
    category: INCIDENT_CATEGORY.BACKGROUND,
    subtype: BACKGROUND_SUBTYPE.FELONY,
    uiSection: "BACKGROUND",
  },
  financial_judgments_liens_child_support: {
    category: INCIDENT_CATEGORY.FINANCIAL,
    subtype: FINANCIAL_SUBTYPE.OTHER,
    uiSection: "FINANCIAL",
  },
  bankruptcy_last_7_years: {
    category: INCIDENT_CATEGORY.BANKRUPTCY,
    subtype: BANKRUPTCY_SUBTYPE.UNKNOWN,
    uiSection: "BANKRUPTCY",
  },
}

export const SLOT_CODES = {
  POLICE_REPORT: "POLICE_REPORT",
  COURT_RECORDS: "COURT_RECORDS",
  SUPERVISION_PROOF: "SUPERVISION_PROOF",
  PAYMENT_PROOF: "PAYMENT_PROOF",
  RECORDS_UNAVAILABLE_LETTER: "RECORDS_UNAVAILABLE_LETTER",
  DISCIPLINARY_ORDER: "DISCIPLINARY_ORDER",
  REINSTATEMENT_LETTER: "REINSTATEMENT_LETTER",
  LIEN_DOCUMENT: "LIEN_DOCUMENT",
  JUDGMENT_DOCUMENT: "JUDGMENT_DOCUMENT",
  CHILD_SUPPORT_COMPLIANCE: "CHILD_SUPPORT_COMPLIANCE",
  BANKRUPTCY_PETITION: "BANKRUPTCY_PETITION",
  DISCHARGE_ORDER: "DISCHARGE_ORDER",
  DEBT_SCHEDULE_SUMMARY: "DEBT_SCHEDULE_SUMMARY",
  SUPPORTING_DOCUMENT: "SUPPORTING_DOCUMENT",
  NARRATIVE_UPLOAD_OPTION: "NARRATIVE_UPLOAD_OPTION",
} as const

export const NARRATIVE_TYPE = {
  PERSONAL_STATEMENT: "PERSONAL_STATEMENT",
  CAUSE_AND_RECOVERY: "CAUSE_AND_RECOVERY",
} as const

type Screen4Responses = {
  prior_discipline?: boolean | null
  pending_legal_matters?: boolean | null
  misdemeanor_10yr?: boolean | null
  felony_ever?: boolean | null
  financial_items_8yr?: boolean | null
  bankruptcy_7yr?: boolean | null
}

type SupabaseAdmin = ReturnType<typeof getSupabaseAdminClient>

export function getStoragePath(params: {
  userId: string
  applicationId: string
  incidentId: string
  slotCode: string
  version: number
  ext: string
  hash: string
}) {
  const { userId, applicationId, incidentId, slotCode, version, ext, hash } = params
  const paddedVersion = String(version).padStart(2, "0")
  return `supporting-materials/${userId}/${applicationId}/${incidentId}/${slotCode}/v${paddedVersion}-${hash}.${ext}`
}

export function getSystemFilename(params: {
  appShortId: string
  incidentShortId: string
  slotCode: string
  version: number
  ext: string
}) {
  const { appShortId, incidentShortId, slotCode, version, ext } = params
  const paddedVersion = String(version).padStart(2, "0")
  return `${appShortId}_${incidentShortId}_${slotCode}_v${paddedVersion}.${ext}`
}

async function ensurePlanRecord(supabase: SupabaseAdmin, applicationId: string) {
  // Cast to any to satisfy supabase-js types when inferring table definitions are absent locally.
  const { data, error } = await (supabase as any)
    .from("supporting_materials_plan")
    .upsert(
      { application_id: applicationId, status: "draft", generated_at: new Date().toISOString() },
      { onConflict: "application_id" }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// Generate incident requirements based on Screen 4 answers.
export async function recomputeSupportingMaterialsPlan(
  applicationId: string,
  answers: Screen4Responses
) {
  const supabase = getSupabaseAdminClient()

  const planRes = await ensurePlanRecord(supabase, applicationId)
  if (planRes.error) throw planRes.error

  const yes = (v?: boolean | null) => v === true

  const normalized: Record<SourceKey, boolean> = {
    prior_license_discipline: yes(answers.prior_discipline),
    pending_legal_matters: yes(answers.pending_legal_matters),
    misdemeanor_last_10_years: yes(answers.misdemeanor_10yr),
    felony_any_time: yes(answers.felony_ever),
    financial_judgments_liens_child_support: yes(answers.financial_items_8yr),
    bankruptcy_last_7_years: yes(answers.bankruptcy_7yr),
  }

  const upsertIncident = async (category: string, subtype: string | null, sourceKey: SourceKey) => {
    const { data, error } = await supabase
      .from("incidents")
      .upsert(
        {
          application_id: applicationId,
          category,
          subtype: subtype ?? null,
          is_active: true,
          source: "questionnaire",
          source_key: sourceKey,
        },
        { onConflict: "application_id,source,source_key" }
      )
      .select()
      .single()
    if (error) throw error
    return data.id as string
  }

  const ensureSlots = async (incidentId: string, slotCodes: string[]) => {
    if (slotCodes.length === 0) return
    const rows = slotCodes.map((slot) => ({
      incident_id: incidentId,
      slot_code: slot,
      required: true,
      status: "missing",
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from("required_document_slots").upsert(rows, {
      onConflict: "incident_id,slot_code",
    })
    if (error) throw error
  }

  const activeQuestionnaireIds: string[] = []

  for (const [sourceKey, value] of Object.entries(normalized) as [SourceKey, boolean][]) {
    const template = QUESTION_TO_INCIDENT[sourceKey]
    if (!template) continue

    if (value) {
      const incidentId = await upsertIncident(template.category, template.subtype, sourceKey)
      activeQuestionnaireIds.push(incidentId)

      const slotPreset =
        template.category === INCIDENT_CATEGORY.BACKGROUND
          ? [
              SLOT_CODES.POLICE_REPORT,
              SLOT_CODES.COURT_RECORDS,
              SLOT_CODES.SUPERVISION_PROOF,
              SLOT_CODES.PAYMENT_PROOF,
              SLOT_CODES.RECORDS_UNAVAILABLE_LETTER,
              SLOT_CODES.NARRATIVE_UPLOAD_OPTION,
            ]
          : template.category === INCIDENT_CATEGORY.DISCIPLINE
          ? [SLOT_CODES.DISCIPLINARY_ORDER, SLOT_CODES.REINSTATEMENT_LETTER, SLOT_CODES.NARRATIVE_UPLOAD_OPTION]
          : template.category === INCIDENT_CATEGORY.FINANCIAL
          ? [
              SLOT_CODES.LIEN_DOCUMENT,
              SLOT_CODES.JUDGMENT_DOCUMENT,
              SLOT_CODES.CHILD_SUPPORT_COMPLIANCE,
              SLOT_CODES.PAYMENT_PROOF,
              SLOT_CODES.NARRATIVE_UPLOAD_OPTION,
            ]
          : [
              SLOT_CODES.BANKRUPTCY_PETITION,
              SLOT_CODES.DISCHARGE_ORDER,
              SLOT_CODES.DEBT_SCHEDULE_SUMMARY,
              SLOT_CODES.NARRATIVE_UPLOAD_OPTION,
            ]

      await ensureSlots(incidentId, slotPreset)
    } else {
      // If answered No, archive the questionnaire-sourced incident for this sourceKey
      await supabase
        .from("incidents")
        .update({ is_active: false })
        .eq("application_id", applicationId)
        .eq("source", "questionnaire")
        .eq("source_key", sourceKey)
    }
  }

  // Ensure only questionnaire-sourced incidents are toggled; leave user_added alone.
  if (activeQuestionnaireIds.length > 0) {
    const { data: existingQuestionnaire } = await supabase
      .from("incidents")
      .select("id")
      .eq("application_id", applicationId)
      .eq("source", "questionnaire")
    const toArchive =
      existingQuestionnaire
        ?.filter((i) => !activeQuestionnaireIds.includes(i.id))
        ?.map((i) => i.id) ?? []
    if (toArchive.length > 0) {
      await supabase.from("incidents").update({ is_active: false }).in("id", toArchive)
    }
  }

  await supabase
    .from("supporting_materials_plan")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("application_id", applicationId)
}

