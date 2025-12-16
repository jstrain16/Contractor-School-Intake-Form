"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoaderThreeFullScreen } from "@/components/ui/loader"

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

type IncidentProgress = {
  incident: Incident
  total: number
  completed: number
}

const CATEGORY_LABEL: Record<string, string> = {
  BACKGROUND: "Background Review Items",
  DISCIPLINE: "Prior Licensing Items",
  FINANCIAL: "Financial Review Items",
  BANKRUPTCY: "Bankruptcy Items",
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<IncidentProgress[]>([])
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const appRes = await fetch("/api/application/current", { credentials: "include" })
        const appJson = await appRes.json()
        if (!appJson?.applicationId) {
          setLoading(false)
          return
        }

        const hubRes = await fetch(`/api/supporting-materials/${appJson.applicationId}`, { cache: "no-store" })
        const hubJson = await hubRes.json()
        const allIncidents: Incident[] = hubJson.incidents ?? []

        const activeIncident = allIncidents.find((i) => i.id === params.id)
        const targetCategory = activeIncident?.category ?? allIncidents[0]?.category ?? null
        setCategory(targetCategory)

        const relevantIncidents = targetCategory
          ? allIncidents.filter((i) => i.category === targetCategory)
          : allIncidents

        const incidentWithProgress: IncidentProgress[] = await Promise.all(
          relevantIncidents.map(async (incident) => {
            const slotsRes = await fetch(`/api/incidents/${incident.id}/slots`, { cache: "no-store" })
            const slotsJson = await slotsRes.json()
            const slots: Slot[] = slotsJson.slots ?? []
            const completed = slots.filter((s) => s.status === "uploaded").length
            return { incident, total: slots.length, completed }
          })
        )

        setIncidents(incidentWithProgress)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params.id])

  const pageTitle = CATEGORY_LABEL[category ?? ""] ?? "Background Review Items"

  const summary = useMemo(() => {
    const missingTotal = incidents.reduce((sum, item) => sum + Math.max(item.total - item.completed, 0), 0)
    return { missingTotal }
  }, [incidents])

  if (loading) {
    return <LoaderThreeFullScreen />
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-5xl px-6 pb-12 pt-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            ←
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Supporting Materials</span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-xs text-slate-900">{pageTitle}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>

        <div className="rounded-xl border border-transparent bg-[#f2f4f8] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="relative flex items-center gap-2 rounded-lg px-5 py-3 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{ background: "linear-gradient(90deg, #ff6900 0%, #f54900 100%)" }}
              onClick={() => router.push("/supporting-materials/incidents/new")}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#f54900]">+</span>
              <span className="text-sm font-semibold leading-none">Add Background Review Item</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {incidents.map(({ incident, total, completed }, idx) => {
            const missing = Math.max(total - completed, 0)
            const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
            const codeLabel = incident.subtype ? incident.subtype.toUpperCase() : `INC-${(idx + 1).toString().padStart(2, "0")}`

            return (
              <Card
                key={incident.id}
                className="relative w-full rounded-xl border border-gray-200 bg-white"
                style={{ boxShadow: "0px 12px 30px rgba(0,0,0,0.05)" }}
              >
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded bg-gray-100 px-3 py-1 text-[#364153]">{codeLabel}</span>
                    {missing > 0 && (
                      <span className="rounded bg-[#ffedd4] px-3 py-1 text-[#ca3500]">{missing} missing</span>
                    )}
                  </div>

                  <div className="text-base font-medium text-slate-900">
                    {incident.subtype ?? "Incident"} — {pageTitle}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between text-xs text-[#4a5565]">
                      <span>
                        Required {completed}/{total || "—"} done
                      </span>
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

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="border border-[#bedbff] bg-blue-50 text-[#1447e6]"
                      onClick={() => router.push(`/supporting-materials/incidents/${incident.id}`)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {summary.missingTotal > 0 && (
          <div className="rounded-lg border border-[#ffe6c7] bg-[#fff8ef] px-4 py-3 text-sm text-[#a15b00]">
            Missing {summary.missingTotal} required item{summary.missingTotal === 1 ? "" : "s"} — please complete all
            uploads.
          </div>
        )}
      </main>
    </div>
  )
}

