"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const options = [
  { id: "free_checklist", name: "Free Checklist", description: "Self-serve guidance", price: "$0" },
  { id: "consultation", name: "Consultation", description: "One-time consult", price: "$149" },
  { id: "premium_app", name: "Premium Application", description: "Hands-on review", price: "$399" },
  { id: "full_service", name: "Full Service", description: "White-glove help", price: "$899" },
]

export default function AssistancePage() {
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/application/current", { credentials: "include" })
      const json = await res.json()
      if (!json?.applicationId) return
      setApplicationId(json.applicationId)
      setSelected(json?.data?.assistancePackage ?? null)
    }
    load()
  }, [])

  const choose = async (id: string) => {
    if (!applicationId) return
    setSaving(true)
    setSaved(false)
    setSelected(id)
    await fetch("/api/application/assistance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, assistancePackage: id }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Assistance Options</h1>
          <p className="text-sm text-slate-600">
            Choose your level of help. Salesforce triggers are deferred and will be added later.
          </p>
          <div className="text-xs text-slate-500 mt-1">{saving ? "Saving…" : saved ? "Saved" : " "}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((opt) => (
            <Card key={opt.id} className={selected === opt.id ? "border-orange-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{opt.name}</span>
                  <span className="text-sm text-slate-500">{opt.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-700">{opt.description}</p>
                <Button onClick={() => choose(opt.id)} disabled={!applicationId}>
                  {selected === opt.id ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

