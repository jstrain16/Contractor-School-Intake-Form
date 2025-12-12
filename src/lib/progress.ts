import { WizardData } from "@/lib/schemas"

// Simplified weight map for 17 phases; adjust as fidelity increases.
export const PROGRESS_WEIGHTS = {
  phase1: 5,
  phase2: 5,
  phase3: 5,
  phase4: 10,
  phase5: 5,
  phase6: 5,
  phase7: 5,
  phase8: 5,
  phase9: 10,
  phase10: 10,
  phase11: 5,
  phase12: 5,
  phase13: 5,
  phase14: 5,
  phase15: 5,
  phase16: 5,
  phase17: 5,
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

export function buildStatus(_data: Partial<WizardData> | null | undefined): StatusSummary {
  // Placeholder: treat each phase as equal weight completion gates based on minimal fields.
  // TODO: refine completion criteria per phase.
  const items: StatusItem[] = [
    { label: "Account", started: true, done: false, weight: PROGRESS_WEIGHTS.phase1 },
    { label: "Licenses", started: true, done: false, weight: PROGRESS_WEIGHTS.phase2 },
    { label: "Class", started: true, done: false, weight: PROGRESS_WEIGHTS.phase3 },
    { label: "Screening", started: true, done: false, weight: PROGRESS_WEIGHTS.phase4 },
    { label: "Assistance", started: true, done: false, weight: PROGRESS_WEIGHTS.phase5 },
    { label: "Business", started: true, done: false, weight: PROGRESS_WEIGHTS.phase6 },
    { label: "FEIN", started: false, done: false, weight: PROGRESS_WEIGHTS.phase7 },
    { label: "Bank", started: false, done: false, weight: PROGRESS_WEIGHTS.phase8 },
    { label: "Owners", started: false, done: false, weight: PROGRESS_WEIGHTS.phase9 },
    { label: "Workers Comp", started: false, done: false, weight: PROGRESS_WEIGHTS.phase10 },
    { label: "Qualifier", started: false, done: false, weight: PROGRESS_WEIGHTS.phase11 },
    { label: "Insurance Prep", started: false, done: false, weight: PROGRESS_WEIGHTS.phase12 },
    { label: "Waiver Prep", started: false, done: false, weight: PROGRESS_WEIGHTS.phase13 },
    { label: "Class Complete", started: false, done: false, weight: PROGRESS_WEIGHTS.phase14 },
    { label: "Exam", started: false, done: false, weight: PROGRESS_WEIGHTS.phase15 },
    { label: "Insurance Active", started: false, done: false, weight: PROGRESS_WEIGHTS.phase16 },
    { label: "Waiver/Submit", started: false, done: false, weight: PROGRESS_WEIGHTS.phase17 },
  ]
  const rawTotal = items.reduce((sum, item) => sum + item.weight, 0)
  const rawCompleted = items.filter((i) => i.done).reduce((sum, item) => sum + item.weight, 0)
  const progress = rawTotal > 0 ? Math.round((rawCompleted / rawTotal) * 100) : 0
  return { items, progress, nextUp: items.find((s) => !s.done)?.label ?? "Review & Submit" }
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


