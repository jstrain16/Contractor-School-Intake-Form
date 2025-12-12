"use client"

import { useEffect, useState } from "react"
import { screen4Schema, type Screen4Data } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const questions: Array<{ key: keyof Screen4Data; label: string }> = [
  { key: "prior_discipline", label: "Prior license disciplinary action" },
  { key: "pending_legal_matters", label: "Pending legal matters" },
  { key: "misdemeanor_10yr", label: "Misdemeanor matters within the last 10 years" },
  { key: "felony_ever", label: "Felony matters (any time)" },
  { key: "financial_items_8yr", label: "Judgments, liens, or child support delinquencies (last 8 years)" },
  { key: "bankruptcy_7yr", label: "Bankruptcy filings (last 7 years)" },
]

export default function ScreeningPage() {
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

  const update = (key: keyof Screen4Data, val: boolean) => {
    const next = { ...responses, [key]: val }
    setResponses(next)
    if (!applicationId) return
    setSaving(true)
    setSaved(false)
    void fetch(`/api/application/${applicationId}/screen4`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: next }),
    })
      .then(() => {
        setSaved(true)
      })
      .finally(() => setSaving(false))
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Background & Financial Questionnaire</h1>
          <p className="text-sm text-slate-600">Answers autosave and generate your Supporting Materials plan.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Screen 4</CardTitle>
            <div className="text-xs text-slate-500">{saving ? "Saving…" : saved ? "Saved" : "Idle"}</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((q) => {
              const val = responses[q.key] ?? false
              return (
                <div key={q.key} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm">{q.label}</span>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={val ? "default" : "outline"}
                      onClick={() => update(q.key, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant={!val ? "default" : "outline"}
                      onClick={() => update(q.key, false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

