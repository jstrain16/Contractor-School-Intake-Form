"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWizardStore } from "@/store/wizard-store"

const options = [
  { id: "free_checklist", name: "Self-Serve (Free Checklist)" },
  { id: "premium_app", name: "Self-Service (Premium App) - $20" },
  { id: "consultation", name: "Hour Consultation - $99" },
  { id: "full_service", name: "Full Application Assistance - $599" },
]

export function StepAssistanceInline() {
  const { prevStep, nextStep } = useWizardStore()
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Assistance Options</CardTitle>
        <div className="text-xs text-slate-500">{saving ? "Saving…" : saved ? "Saved" : " "}</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => void choose(opt.id)}
            className={`w-full rounded-md border px-4 py-3 text-left ${selected === opt.id ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white"}`}
          >
            <div className="text-sm font-semibold text-slate-900">{opt.name}</div>
          </button>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  )
}

