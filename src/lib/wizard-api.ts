import { WizardData } from "./schemas"

type WizardResponse = { data: WizardData | null; applicationId: string | null }

export async function fetchWizardData(): Promise<WizardResponse> {
  const res = await fetch("/api/application", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to load application data")
  return (await res.json()) as WizardResponse
}

export async function saveWizardData(payload: Partial<WizardData>, applicationId: string | null) {
  const res = await fetch("/api/application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload, applicationId }),
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to save application data")
  return res.json()
}

