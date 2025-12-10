import { WizardData } from "@/lib/schemas"

export const PROGRESS_WEIGHTS = {
  education: 30, // 25/30-hour course + business & law exam for general
  entity: 10,
  bank: 10,
  gl: 20,
  wc: 20,
  remainder: 10, // experience, dopl, etc.
}

export type StatusItem = {
  label: string
  done: boolean
  started: boolean
  weight: number
}

export type StatusSummary = {
  items: StatusItem[]
  progress: number
  nextUp: string
}

export type MissingStep = {
  label: string
  hint: string
}

export function buildStatus(data: Partial<WizardData> | null | undefined): StatusSummary {
  const d = data || {}
  const hasGeneral =
    (d.step0?.generalLicenses && d.step0.generalLicenses.length > 0) || d.step0?.licenseType === "general"
  const hasSpecialty =
    (d.step0?.specialtyLicenses && d.step0.specialtyLicenses.length > 0) || d.step0?.licenseType === "specialty"

  const items: StatusItem[] = [
    {
      label: "Education",
      started:
        !!d.step1?.preLicensureCompleted ||
        !!d.step1?.courseProvider ||
        !!d.step1?.dateCompleted ||
        (d.step1?.exemptions?.length ?? 0) > 0,
      done: !!d.step1?.preLicensureCompleted || (d.step1?.exemptions?.length ?? 0) > 0,
      weight: PROGRESS_WEIGHTS.education,
    },
    {
      label: "Entity",
      started:
        !!d.step2?.legalBusinessName ||
        !!d.step2?.entityType ||
        !!d.step2?.stateOfIncorporation ||
        !!d.step2?.utahEntityNumber ||
        !!d.step2?.dateRegistered ||
        !!d.step2?.businessPhone ||
        !!d.step2?.businessEmail ||
        !!d.step2?.physicalAddress?.street,
      done: !!d.step2?.legalBusinessName && !!d.step2?.federalEin,
      weight: PROGRESS_WEIGHTS.entity,
    },
    {
      label: "Business Bank Account",
      started: d.step2?.hasBusinessBankAccount === true || !!d.step2?.voidedCheckFile,
      done: !!d.step2?.hasBusinessBankAccount,
      weight: PROGRESS_WEIGHTS.bank,
    },
    {
      label: "General Liability",
      started:
        d.step3?.hasGlInsurance === true ||
        !!d.step3?.glCarrier ||
        !!d.step3?.glPolicyNumber ||
        !!d.step3?.glEffectiveDate ||
        !!d.step3?.glExpirationDate,
      done: d.step3?.hasGlInsurance === true,
      weight: PROGRESS_WEIGHTS.gl,
    },
    {
      label: "Workers Compensation",
      started:
        d.step3?.hasWorkersComp === true ||
        d.step3?.hasWcWaiver === true ||
        !!d.step3?.wcCarrier ||
        !!d.step3?.wcPolicyNumber,
      done: d.step0?.hasEmployees ? d.step3?.hasWorkersComp === true : d.step3?.hasWcWaiver === true,
      weight: PROGRESS_WEIGHTS.wc,
    },
    {
      label: "Experience / Qualifier",
      started: (d.step4?.experienceEntries?.length ?? 0) > 0 || d.step4?.hasExperience === true,
      done: hasGeneral ? !!d.step4?.hasExperience : true,
      weight: PROGRESS_WEIGHTS.remainder / 2,
    },
    {
      label: "Business & Law Exam",
      started: hasGeneral ? !!(d.step5?.examStatus && d.step5.examStatus !== "not_scheduled") : false,
      done: hasGeneral ? d.step5?.examStatus === "passed" : true,
      weight: hasGeneral ? PROGRESS_WEIGHTS.remainder / 2 : 0,
    },
    {
      label: "DOPL Application",
      started: !!d.step6?.doplAppCompleted || !!d.step6?.reviewRequested,
      done: d.step6?.doplAppCompleted === true,
      weight: PROGRESS_WEIGHTS.dopl,
    },
  ]

  const rawTotal = items.reduce((sum, item) => sum + item.weight, 0)
  const rawCompleted = items.filter((i) => i.done).reduce((sum, item) => sum + item.weight, 0)
  const progress = rawTotal > 0 ? Math.round((rawCompleted / rawTotal) * 100) : 0

  return {
    items,
    progress,
    nextUp: items.find((s) => !s.done)?.label ?? "Review & Submit",
  }
}

export function getMissingSteps(data: Partial<WizardData> | null | undefined): MissingStep[] {
  const d = buildStatus(data)
  return d.items
    .filter((i) => !i.done)
    .map((i) => ({
      label: i.label,
      hint: missingHint(i.label),
    }))
}

function missingHint(label: string): string {
  switch (label) {
    case "Account Setup":
      return "Complete your profile: name, license type, and email."
    case "Pre-Licensure / Education":
      return "Upload course completion or exemptions."
    case "Business Entity, FEIN & Banking":
      return "Provide legal business name and FEIN."
    case "General Liability":
      return "Confirm general liability coverage."
    case "Workers Compensation":
      return "Add workers comp or waiver if no employees."
    case "Experience / Qualifier":
      return "Document qualifier experience if required."
    case "Business & Law Exam":
      return "Pass the Business & Law exam or provide specialty proof."
    case "DOPL Application":
      return "Complete and mark DOPL application as submitted."
    default:
      return ""
  }
}


