type WizardResponse = { data: any; applicationId: string | null; status?: string }

const DEFAULT_TIMEOUT_MS = 10000

export async function fetchWizardData(timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<WizardResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch("/api/application", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
    if (!res.ok) throw new Error("Failed to load application data")
    return (await res.json()) as WizardResponse
  } finally {
    clearTimeout(timer)
  }
}

export async function saveWizardData(payload: any, applicationId: string | null) {
  const res = await fetch("/api/application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to save application data")
  return res.json()
}

