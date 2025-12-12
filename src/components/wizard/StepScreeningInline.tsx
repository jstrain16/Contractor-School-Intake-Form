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
    <Card className="w-full max-w-5xl mx-auto border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[22px] text-[#0c1c3a] font-semibold">Criminal &amp; Financial History</CardTitle>
        <p className="text-sm text-slate-600">
          Answer the screening questions below. If you select “Yes” for any item, we’ll collect supporting materials next.
        </p>
        <div className="text-xs text-slate-500">{saving ? "Saving…" : saved ? "Saved" : "\u00A0"}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {questions.map((q) => {
            const val = responses[q.key] ?? false
            return (
              <div
                key={q.key}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <span className="text-base font-medium text-slate-800">{q.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void update(q.key, true)}
                    className={`h-10 min-w-[64px] rounded-md px-4 text-sm font-semibold transition ${
                      val
                        ? "bg-[#0b2145] text-white"
                        : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => void update(q.key, false)}
                    className={`h-10 min-w-[64px] rounded-md px-4 text-sm font-semibold transition ${
                      !val
                        ? "bg-[#0b2145] text-white"
                        : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="rounded-lg bg-[#f5f8ff] px-4 py-3 text-sm text-slate-700 border border-slate-100">
          If any answer is “Yes,” we’ll guide you to the Supporting Materials section to add incidents, narratives, and
          required uploads. Nothing you’ve already entered will be deleted.
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button variant="outline" onClick={() => window.open("/supporting-materials", "_blank")}>
            Open Supporting Materials
          </Button>
          <Button onClick={nextStep}>Next Step</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

