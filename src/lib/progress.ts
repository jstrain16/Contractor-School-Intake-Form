// V2 progress helper driven by phase completion in contractor_applications.data
export const PHASE_LABELS = [
  "Authentication",
  "License Type",
  "Class Booking",
  "Screening",
  "Assistance",
  "Business Setup",
  "Qualifier",
  "Insurance Prep",
  "WC Waiver Prep",
  "Class Complete",
  "Exam",
  "Insurance Active",
  "WC Submit",
  "DOPL Assembly",
  "Review",
  "Submission",
  "Tracking",
]

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

export function buildStatus(data: any): StatusSummary {
  const completed = Array.isArray(data?.completedPhases) ? data.completedPhases : []
  const activePhase = typeof data?.active_phase === "number" ? data.active_phase : 1
  const items: StatusItem[] = PHASE_LABELS.map((label, idx) => {
    const phaseId = idx + 1
    const done = completed.includes(phaseId)
    const started = done || activePhase >= phaseId
    return {
      label,
      done,
      started,
      weight: 1,
    }
  })
  const rawTotal = items.length
  const rawCompleted = items.filter((i) => i.done).length
  const progress = data?.progress ?? (rawTotal > 0 ? Math.round((rawCompleted / rawTotal) * 100) : 0)
  return { items, progress, nextUp: items.find((s) => !s.done)?.label ?? "Review & Submit" }
}

export function getMissingSteps(data: any): MissingStep[] {
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


