"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function SupportingMaterialsPage() {
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

  const sections = useMemo(() => {
    const grouped: Record<string, Slot[]> = {}
    incidents.forEach((incident) => {
      grouped[incident.id] = slots.filter((s) => s.incident_id === incident.id)
    })
    return incidents.map((incident) => ({
      incident,
      slots: grouped[incident.id] ?? [],
    }))
  }, [incidents, slots])

  if (loading) return <div className="p-6">Loading supporting materials...</div>
  if (!applicationId) return <div className="p-6">No application found.</div>

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Supporting Materials</h1>
          <p className="text-sm text-slate-600">Upload the required documents for each incident.</p>
        </div>

        <div className="grid gap-4">
          {sections.map(({ incident, slots }) => {
            const missing = slots.filter((s) => s.status !== "uploaded").length
            return (
              <Card key={incident.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{incident.category}</CardTitle>
                    <p className="text-xs text-slate-500">{incident.subtype || "General"}</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push(`/supporting-materials/incidents/${incident.id}`)}>
                    Open
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">
                    {missing === 0 ? "Complete" : `${missing} item${missing === 1 ? "" : "s"} missing`}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span>{slot.slot_code}</span>
                        <span className="text-xs text-slate-500">{slot.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

