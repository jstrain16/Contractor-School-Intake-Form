"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Incident = {
  id: string
  category: string
  subtype?: string | null
  is_active: boolean
}

type Slot = {
  id: string
  incident_id: string
  slot_code: string
  status: string
}

const CATEGORY_ORDER = ["BACKGROUND", "DISCIPLINE", "FINANCIAL", "BANKRUPTCY"] as const
const CATEGORY_LABEL: Record<string, string> = {
  BACKGROUND: "Background Review Items",
  DISCIPLINE: "Prior Licensing Items",
  FINANCIAL: "Financial Review Items",
  BANKRUPTCY: "Bankruptcy Items",
}

const CARD_BG: Record<string, string> = {
  BACKGROUND: "from-[#e7f1ff] to-[#f7fbff]",
  DISCIPLINE: "from-[#f7e8ff] to-[#fbf8ff]",
  FINANCIAL: "from-[#e8fff1] to-[#f7fff9]",
  BANKRUPTCY: "from-[#fff2e8] to-[#fffaf7]",
}

const PILL_COLOR = {
  warning: "bg-[#fff4e5] text-[#c05621]",
  success: "bg-[#e6fffa] text-[#276749]",
  info: "bg-[#e7f1ff] text-[#1a365d]",
}

export function SupportingMaterialsInline() {
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const appRes = await fetch("/api/application/current", { credentials: "include" })
        const appJson = await appRes.json()
        if (!appJson?.applicationId) return
        setApplicationId(appJson.applicationId)

        const hubRes = await fetch(`/api/supporting-materials/${appJson.applicationId}`, { cache: "no-store" })
        const hubJson = await hubRes.json()
        setIncidents(hubJson.incidents ?? [])
        setSlots(hubJson.slots ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const byCategory: Record<string, { incidents: Incident[]; missing: number }> = {}
    CATEGORY_ORDER.forEach((c) => {
      byCategory[c] = { incidents: [], missing: 0 }
    })
    incidents.forEach((incident) => {
      const cat = incident.category
      if (!byCategory[cat]) byCategory[cat] = { incidents: [], missing: 0 }
      byCategory[cat].incidents.push(incident)
    })
    slots.forEach((slot) => {
      const incident = incidents.find((i) => i.id === slot.incident_id)
      if (!incident) return
      if (slot.status !== "uploaded") {
        if (!byCategory[incident.category]) byCategory[incident.category] = { incidents: [], missing: 0 }
        byCategory[incident.category].missing += 1
      }
    })
    return byCategory
  }, [incidents, slots])

  const totalMissing = Object.values(grouped).reduce((sum, g) => sum + g.missing, 0)
  const statusLabel = totalMissing === 0 ? "Complete" : incidents.length > 0 ? "In Progress" : "Not started"
  const statusPill =
    totalMissing === 0
      ? PILL_COLOR.success
      : incidents.length > 0
      ? PILL_COLOR.info
      : PILL_COLOR.warning

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading supporting materials...</div>
  if (!applicationId) return <div className="p-6 text-sm text-slate-600">No application found.</div>

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">Step 2 of 2</div>
          <h2 className="text-lg font-semibold text-slate-900">Supporting Materials</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill}`}>{statusLabel}</span>
      </header>

      {totalMissing > 0 && (
        <div className="rounded-md border border-[#ffe6c7] bg-[#fff8ef] px-4 py-3 text-sm text-[#a15b00]">
          Missing {totalMissing} required item{totalMissing === 1 ? "" : "s"} — Please complete all required items to continue with your application.
        </div>
      )}

      <div className="space-y-4">
        {CATEGORY_ORDER.map((cat) => {
          const data = grouped[cat] || { incidents: [], missing: 0 }
          const label = CATEGORY_LABEL[cat] || cat
          const incidentsCount = data.incidents.length
          return (
            <Card
              key={cat}
              className={`border border-slate-200 bg-gradient-to-br ${CARD_BG[cat] ?? "from-white to-white"}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">{label}</div>
                  <div className="text-xs text-slate-600">
                    {incidentsCount === 0 ? "No incidents recorded" : `${incidentsCount} incident${incidentsCount === 1 ? "" : "s"}`}
                  </div>
                  <div className="text-[11px] text-slate-500">Uploads are labeled automatically (slot + version).</div>
                </div>
                <div className="flex items-center gap-2">
                  {data.missing > 0 && (
                    <span className="rounded-full bg-[#ffe6c7] px-2 py-1 text-[11px] font-semibold text-[#a15b00]">
                      {data.missing} missing
                    </span>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const target = data.incidents[0]
                      if (target) router.push(`/supporting-materials/incidents/${target.id}`)
                      else router.push("/supporting-materials/incidents/new")
                    }}
                  >
                    Open
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push("/onboarding/screening")}>
          Return to Questions
        </Button>
        <Button variant="outline" onClick={() => router.refresh()}>
          Save &amp; Continue Later
        </Button>
      </div>
    </div>
  )
}

