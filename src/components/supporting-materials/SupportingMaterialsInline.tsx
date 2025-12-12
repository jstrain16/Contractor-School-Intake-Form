"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IncidentDetailInline } from "./IncidentDetailInline"

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

type FileRow = {
  id: string
  system_filename: string
  version: number
  uploaded_at?: string
  is_active: boolean
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
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [detailSlots, setDetailSlots] = useState<Slot[]>([])
  const [detailFiles, setDetailFiles] = useState<Record<string, FileRow[]>>({})
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [view, setView] = useState<"hub" | { type: "section"; category: string } | { type: "detail"; incidentId: string }>("hub")
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const appRes = await fetch("/api/application/current", { credentials: "include" })
        const appJson = await appRes.json()
        if (!appJson?.applicationId) return
        setApplicationId(appJson.applicationId)

        const refreshData = async () => {
          const hubRes = await fetch(`/api/supporting-materials/${appJson.applicationId}`, { cache: "no-store" })
          const hubJson = await hubRes.json()
          setIncidents(hubJson.incidents ?? [])
          setSlots(hubJson.slots ?? [])
          return hubJson.incidents ?? []
        }

        await refreshData()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grouped = useMemo(() => {
    const byCategory: Record<string, { incidents: Incident[]; missing: number; totalSlots: number }> = {}
    CATEGORY_ORDER.forEach((c) => {
      byCategory[c] = { incidents: [], missing: 0, totalSlots: 0 }
    })
    incidents.forEach((incident) => {
      const cat = incident.category
      if (!byCategory[cat]) byCategory[cat] = { incidents: [], missing: 0, totalSlots: 0 }
      byCategory[cat].incidents.push(incident)
    })
    slots.forEach((slot) => {
      const incident = incidents.find((i) => i.id === slot.incident_id)
      if (!incident) return
      const bucket = byCategory[incident.category] || { incidents: [], missing: 0, totalSlots: 0 }
      bucket.totalSlots += 1
      if (slot.status !== "uploaded") {
        bucket.missing += 1
      }
      byCategory[incident.category] = bucket
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

  const handleOpenIncident = async (incidentId: string) => {
    setSelectedIncidentId(incidentId)
    setView({ type: "detail", incidentId })
    setLoadingDetail(true)
    try {
      const resSlots = await fetch(`/api/incidents/${incidentId}/slots`, { cache: "no-store" })
      const jsonSlots = await resSlots.json()
      const slotsData: Slot[] = jsonSlots.slots ?? []
      setDetailSlots(slotsData)

      const groupedFiles: Record<string, FileRow[]> = {}
      for (const slot of slotsData) {
        const resFiles = await fetch(`/api/slots/${slot.id}/files`, { cache: "no-store" })
        const jsonFiles = await resFiles.json()
        groupedFiles[slot.id] = jsonFiles.files ?? []
      }
      setDetailFiles(groupedFiles)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleOpenCategory = (category: string) => {
    setView({ type: "section", category })
    setSelectedIncidentId(null)
  }

  const handleAddIncident = async (category: string) => {
    if (!applicationId) return
    await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, category }),
    })
    await refreshHub()
  }

  const refreshHub = async () => {
    if (!applicationId) return
    const hubRes = await fetch(`/api/supporting-materials/${applicationId}`, { cache: "no-store" })
    const hubJson = await hubRes.json()
    setIncidents(hubJson.incidents ?? [])
    setSlots(hubJson.slots ?? [])
  }

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading supporting materials...</div>
  if (!applicationId) return <div className="p-6 text-sm text-slate-600">No application found.</div>

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null

  const hubView = (
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

      <div className="rounded-xl border border-slate-200 bg-[#f7f8fb] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="relative flex items-center gap-2 rounded-lg px-5 py-3 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
            style={{ background: "linear-gradient(90deg, #ff6900 0%, #f54900 100%)" }}
            onClick={() => handleAddIncident("BACKGROUND")}
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#f54900]">+</span>
            <span className="text-sm font-semibold leading-none">Add Background Review Item</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORY_ORDER.map((cat) => {
          const data = grouped[cat] || { incidents: [], missing: 0, totalSlots: 0 }
          const label = CATEGORY_LABEL[cat] || cat
          const incidentsCount = data.incidents.length
          const missingLabel =
            data.missing > 0
              ? `${data.missing} required item${data.missing === 1 ? "" : "s"} missing`
              : data.totalSlots === 0
              ? "No incidents recorded"
              : "All items uploaded"
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
                  <div className="text-[11px] text-slate-600">{missingLabel}</div>
                </div>
                <div className="flex items-center gap-2">
                  {data.missing > 0 && (
                    <span className="rounded-full bg-[#ffe6c7] px-2 py-1 text-[11px] font-semibold text-[#a15b00]">
                      {data.missing} missing
                    </span>
                  )}
                  <Button variant="outline" onClick={() => handleOpenCategory(cat)}>
                    Open
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading supporting materials...</div>
  if (!applicationId) return <div className="p-6 text-sm text-slate-600">No application found.</div>

  const currentView =
    view === "hub" ? (
      hubView
    ) : view.type === "section" ? (
      <SectionListInline
        category={view.category}
        categoryLabel={CATEGORY_LABEL[view.category]}
        incidents={incidents.filter((i) => i.category === view.category)}
        slots={slots.filter((s) => incidents.find((i) => i.id === s.incident_id)?.category === view.category)}
        onBack={() => setView("hub")}
        onOpenIncident={handleOpenIncident}
        onAddIncident={() => handleAddIncident(view.category)}
      />
    ) : selectedIncident ? (
      <IncidentDetailInline
        incident={selectedIncident}
        slots={detailSlots}
        files={detailFiles}
        loading={loadingDetail}
        onBack={() => setView({ type: "section", category: selectedIncident.category })}
        onRefresh={() => handleOpenIncident(selectedIncident.id)}
      />
    ) : (
      hubView
    )

  return (
    <div className="space-y-4">
      {currentView}
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

type SectionListProps = {
  category: string
  categoryLabel: string
  incidents: Incident[]
  slots: Slot[]
  onBack: () => void
  onOpenIncident: (id: string) => void
  onAddIncident: () => void
}

function SectionListInline({ categoryLabel, incidents, slots, onBack, onOpenIncident, onAddIncident }: SectionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Supporting Materials → <span className="font-semibold text-slate-900">{categoryLabel}</span>
        </div>
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{categoryLabel}</h2>
        <Button
          onClick={onAddIncident}
          className="bg-gradient-to-r from-[#ff6900] to-[#f54900] text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {incidents.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
            No incidents recorded. Add an item to get started.
          </div>
        )}
        {incidents.map((incident, idx) => {
          const incidentSlots = slots.filter((s) => s.incident_id === incident.id)
          const completed = incidentSlots.filter((s) => s.status === "uploaded").length
          const total = incidentSlots.length
          const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
          const missing = Math.max(total - completed, 0)
          const codeLabel = incident.subtype ? incident.subtype.toUpperCase() : `INC-${(idx + 1).toString().padStart(2, "0")}`

          return (
            <div
              key={incident.id}
              className="relative w-full rounded-xl border border-gray-200 bg-white px-6 py-5"
              style={{ boxShadow: "0px 12px 30px rgba(0,0,0,0.05)" }}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded bg-gray-100 px-3 py-1 text-[#364153]">{codeLabel}</span>
                {missing > 0 && <span className="rounded bg-[#ffedd4] px-3 py-1 text-[#ca3500]">{missing} missing</span>}
              </div>
              <div className="mt-2 text-base font-medium text-slate-900">{incident.subtype ?? "Incident"}</div>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <div className="flex items-center justify-between text-xs text-[#4a5565]">
                  <span>Required {completed}/{total || "—"} done</span>
                  <span className="text-[#101828]">{percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#d6d6db]">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percent}%`,
                      background: "linear-gradient(90deg, #ff6900 0%, #f54900 100%)",
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="border border-[#bedbff] bg-blue-50 text-[#1447e6]"
                  onClick={() => onOpenIncident(incident.id)}
                >
                  Open
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

