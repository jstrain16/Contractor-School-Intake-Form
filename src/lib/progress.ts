import { WizardData } from "@/lib/schemas"

export const PROGRESS_WEIGHTS = {
  licenseSetup: 5,
  preLicensure: 15,
  business: 25,
  gl: 9,
  wc: 11,
  experience: 10,
  exams: 10,
  dopl: 2,
}

export type StatusItem = {
  label: string
  done: boolean
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
  const licenseType = d.step0?.licenseType
  const isGeneral = licenseType === "general"
  const isSpecialty = licenseType === "specialty"

  const items: StatusItem[] = [
    {
      label: "Account Setup",
      done: !!d.step0?.firstName && !!d.step0?.licenseType && !!d.step0?.email,
      weight: PROGRESS_WEIGHTS.licenseSetup,
    },
    {
      label: "Pre-Licensure / Education",
      done: !!d.step1?.preLicensureCompleted || (d.step1?.exemptions?.length ?? 0) > 0,
      weight: PROGRESS_WEIGHTS.preLicensure,
    },
    {
      label: "Business Entity, FEIN & Banking",
      done: !!d.step2?.legalBusinessName && !!d.step2?.federalEin,
      weight: PROGRESS_WEIGHTS.business,
    },
    {
      label: "General Liability",
      done: d.step3?.hasGlInsurance === true,
      weight: PROGRESS_WEIGHTS.gl,
    },
    {
      label: "Workers Compensation",
      done: d.step0?.hasEmployees ? d.step3?.hasWorkersComp === true : d.step3?.hasWcWaiver === true,
      weight: PROGRESS_WEIGHTS.wc,
    },
    {
      label: "Experience / Qualifier",
      done: isGeneral ? !!d.step4?.hasExperience : isSpecialty ? true : false,
      weight: PROGRESS_WEIGHTS.experience,
    },
    {
      label: "Business & Law Exam",
      done: isGeneral ? d.step5?.examStatus === "passed" : isSpecialty ? true : false,
      weight: PROGRESS_WEIGHTS.exams,
    },
    {
      label: "DOPL Application",
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

