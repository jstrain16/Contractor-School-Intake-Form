"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type SectionKey = "step0" | "step1" | "step2" | "step3" | "step4" | "step5" | "step6" | "step7"

type Props = {
  label: string
  sectionKey: SectionKey
  applicationId: string
  data?: Record<string, unknown> | null
  renderView: (data?: Record<string, unknown> | null) => React.ReactNode
}

export function AdminSectionBlock({ label, sectionKey, applicationId, data, renderView }: Props) {
  const [editing, setEditing] = useState(false)
  const [jsonValue, setJsonValue] = useState(() => JSON.stringify(data || {}, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleEdit = () => {
    setEditing((prev) => !prev)
    setError(null)
  }

  const handleSave = async () => {
    setError(null)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonValue || "{}")
    } catch {
      setError("Invalid JSON")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, sectionKey, data: parsed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to save")
      }
      setEditing(false)
  } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <details className="border rounded-md p-3 bg-slate-50">
      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-slate-800">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <Button variant={editing ? "secondary" : "outline"} size="sm" onClick={(e) => { e.preventDefault(); toggleEdit() }}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          {editing && (
            <Button size="sm" onClick={(e) => { e.preventDefault(); handleSave() }} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </summary>
      <div className="mt-3 space-y-3 text-sm">
        {editing ? (
          <>
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={10}
              value={jsonValue}
              onChange={(e) => setJsonValue(e.target.value)}
            />
            {error && <div className="text-xs text-red-600">{error}</div>}
          </>
        ) : (
          renderView(data)
        )}
      </div>
    </details>
  )
}

