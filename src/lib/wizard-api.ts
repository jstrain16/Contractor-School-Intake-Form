export async function fetchWizardData() {
  const res = await fetch("/api/wizard", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to load wizard data")
  return (await res.json()) as { data: Record<string, any> | null; applicationId: string | null }
}

export async function saveWizardData(payload: Record<string, any>, applicationId: string | null) {
  const res = await fetch("/api/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload, applicationId }),
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to save wizard data")
  return res.json()
}

