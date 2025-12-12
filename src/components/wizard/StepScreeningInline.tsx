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

  const grouped = [
    {
      title: "Prior Licensing Items",
      items: [{ key: "prior_discipline" as const, label: "Have you ever had a professional license denied, suspended, revoked, or placed on probation?" }],
    },
    {
      title: "Background Review Items",
      items: [
        { key: "pending_legal_matters" as const, label: "Do you have any pending legal matters?" },
        { key: "misdemeanor_10yr" as const, label: "Any misdemeanor matters in the last 10 years?" },
        { key: "felony_ever" as const, label: "Any felony matters at any time?" },
      ],
    },
    {
      title: "Financial Review Items",
      items: [{ key: "financial_items_8yr" as const, label: "Any judgments, liens, or child support delinquencies in the last 8 years?" }],
    },
    {
      title: "Bankruptcy Items",
      items: [{ key: "bankruptcy_7yr" as const, label: "Any bankruptcy filings in the last 7 years?" }],
    },
  ]

  return (
    <Card className="w-full max-w-5xl mx-auto border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 pt-5 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">Background &amp; Financial Review</div>
        <div>Step 1 of 2</div>
      </div>
      <div className="mx-6 mt-2 h-1 rounded-full bg-[#ffe4c5]">
        <div className="h-1 w-1/2 rounded-full bg-[#f46a00]" />
      </div>
      <CardHeader className="pb-3 pt-4">
        <div className="rounded-lg border border-slate-200 bg-[#f2f7ff] px-4 py-3 text-sm text-slate-700">
          <div className="font-medium text-slate-800">Please answer the following questions truthfully.</div>
          <div className="text-xs text-slate-600">
            If you answer “Yes” to any question, you’ll be able to provide details and upload supporting materials on the next screen.
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{saving ? "Saving…" : saved ? "Saved" : "\u00A0"}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.map((group) => (
          <div key={group.title} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="text-sm font-semibold text-slate-900 mb-3">{group.title}</div>
            <div className="space-y-3">
              {group.items.map((item) => {
                const val = responses[item.key] ?? false
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="text-sm text-slate-800">{item.label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => void update(item.key, false)}
                        className={`h-10 rounded-md border text-sm font-semibold transition ${
                          !val
                            ? "border-[#f46a00] text-[#f46a00] bg-white"
                            : "border-slate-200 text-slate-800 bg-white hover:bg-slate-50"
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => void update(item.key, true)}
                        className={`h-10 rounded-md border text-sm font-semibold transition ${
                          val
                            ? "border-[#f46a00] text-[#f46a00] bg-white"
                            : "border-slate-200 text-slate-800 bg-white hover:bg-slate-50"
                        }`}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 pb-6">
        <Button variant="outline" onClick={prevStep} className="w-full sm:w-auto">
          Previous
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => window.open("/supporting-materials", "_blank")} className="w-full sm:w-auto">
            Open Supporting Materials
          </Button>
          <Button onClick={nextStep} className="w-full sm:w-auto bg-gradient-to-r from-[#ff6900] to-[#f54900]">
            Continue to Supporting Materials
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

