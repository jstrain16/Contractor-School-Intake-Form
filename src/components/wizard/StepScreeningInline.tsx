"use client"

import { useEffect, useState } from "react"
import { screen4Schema, type Screen4Data } from "@/lib/schemas"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWizardStore } from "@/store/wizard-store"

const questions: Array<{ key: keyof Screen4Data; label: string }> = [
  { key: "prior_discipline", label: "Prior license disciplinary action" },
  { key: "pending_legal_matters", label: "Pending legal matters" },
  { key: "misdemeanor_10yr", label: "Misdemeanor convictions within 10 years" },
  { key: "felony_ever", label: "Felony convictions" },
  { key: "financial_items_8yr", label: "Judgments, liens, child support delinquencies (last 8 years)" },
  { key: "bankruptcy_7yr", label: "Bankruptcy (last 7 years)" },
]

export function StepScreeningInline() {
  const { prevStep, nextStep } = useWizardStore()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [responses, setResponses] = useState<Screen4Data>({
    prior_discipline: false,
    pending_legal_matters: false,
    misdemeanor_10yr: false,
    felony_ever: false,
    financial_items_8yr: false,
    bankruptcy_7yr: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/application/current", { credentials: "include" })
      const json = await res.json()
      if (!json?.applicationId) return
      setApplicationId(json.applicationId)

      const screenRes = await fetch(`/api/application/${json.applicationId}/screen4`)
      const screenJson = await screenRes.json()
      if (screenJson?.responses) {
        const parsed = screen4Schema.parse(screenJson.responses)
        setResponses(parsed)
      }
    }
    load()
  }, [])

  const update = async (key: keyof Screen4Data, val: boolean) => {
    const next = { ...responses, [key]: val }
    setResponses(next)
    if (!applicationId) return
    setSaving(true)
    setSaved(false)
    await fetch(`/api/application/${applicationId}/screen4`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: next }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Criminal &amp; Financial History Screening</CardTitle>
        <div className="text-xs text-slate-500">{saving ? "Saving…" : saved ? "Saved" : " "}</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((q) => {
          const val = responses[q.key] ?? false
          return (
            <div key={q.key} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
              <span className="text-sm text-slate-800">{q.label}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={val ? "default" : "outline"} onClick={() => void update(q.key, true)}>
                  Yes
                </Button>
                <Button size="sm" variant={!val ? "default" : "outline"} onClick={() => void update(q.key, false)}>
                  No
                </Button>
              </div>
            </div>
          )
        })}
        <p className="text-sm text-slate-600">
          If any answer is Yes, you will be directed to Supporting Materials to provide incident details and uploads.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/supporting-materials", "_blank")}>Open Supporting Materials</Button>
          <Button onClick={nextStep}>Continue</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

