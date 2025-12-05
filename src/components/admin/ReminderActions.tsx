"use client"

import { useMemo, useState } from "react"
import { getMissingSteps, buildStatus } from "@/lib/progress"
import { WizardData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"

type Props = {
  applicationId: string
  data: Partial<WizardData> | null
  email: string | null
}

export function ReminderActions({ applicationId, data, email }: Props) {
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const missingSteps = useMemo(() => getMissingSteps(data), [data])
  const progress = useMemo(() => buildStatus(data).progress, [data])

  const canSend = !!email

  const callApi = async (send: boolean) => {
    setError(null)
    setMessage(null)
    if (send) {
      setSendLoading(true)
    } else {
      setLoading(true)
    }
    try {
      const res = await fetch("/api/admin/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          draft: draft.trim() || undefined,
          send,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Request failed")
      }
      if (json.draft) setDraft(json.draft)
      if (send) {
        setMessage("Reminder sent")
      } else {
        setMessage("Draft generated")
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to process reminder"
      setError(msg)
    } finally {
      if (send) {
        setSendLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Reminder Email</p>
          <p className="text-xs text-slate-500">
            {email ? `Will send to ${email}` : "No email on file"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || sendLoading}
            onClick={() => callApi(false)}
          >
            {loading ? "Generating..." : "Generate AI Draft"}
          </Button>
          <Button
            size="sm"
            disabled={!canSend || sendLoading}
            onClick={() => callApi(true)}
          >
            {sendLoading ? "Sending..." : "Send via Email"}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <p className="text-xs font-semibold text-slate-700">Missing steps</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {missingSteps.length === 0 && <li>None — applicant at {progress}%</li>}
            {missingSteps.map((m) => (
              <li key={m.label} className="rounded bg-slate-50 px-2 py-1">
                <span className="font-semibold">{m.label}:</span> {m.hint}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold text-slate-700">Email draft</p>
          <textarea
            className="mt-2 h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-orange-400 focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Generate a draft or write your own reminder..."
          />
        </div>
      </div>

      {(message || error) && (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-xs ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}
    </div>
  )
}

