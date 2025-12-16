"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ClipboardCheck } from "lucide-react"

type Props = {
  label: string
  sectionKey: string
  applicationId: string
  data?: Record<string, unknown> | null
  children: React.ReactNode
  simple?: boolean
}

export function AdminSectionBlock({ label, sectionKey, applicationId, data, children, simple = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const initialData = useMemo(() => (data && typeof data === "object" ? data : {}), [data])
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)

  const toggleEdit = () => {
    setEditing((prev) => !prev)
    setError(null)
    if (!editing) {
      setFormData(initialData)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/admin/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, sectionKey, data: formData }),
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

  if (simple) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 text-sm">{children}</div>
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{label}</div>
            <div className="text-xs text-slate-500">Click to view details</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={editing ? "default" : "outline"} size="sm" onClick={toggleEdit}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-sm">
        {editing ? <EditableFields data={formData} onChange={setFormData} error={error} /> : children}
      </div>
    </div>
  )
}

function EditableFields({
  data,
  onChange,
  error,
}: {
  data: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  error: string | null
}) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) {
    return <div className="text-slate-600">No fields to edit.</div>
  }

  const updateValue = (key: string, value: unknown) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        if (typeof value === "boolean") {
          return (
            <label
              key={key}
              className="flex items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
            >
              <span className="text-sm font-medium text-slate-800">{formatLabel(key)}</span>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => updateValue(key, e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          )
        }
        if (typeof value === "number") {
          return (
            <div key={key} className="space-y-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-slate-800">{formatLabel(key)}</div>
              <input
                type="number"
                defaultValue={value}
                onChange={(e) => updateValue(key, Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )
        }
        if (Array.isArray(value)) {
          return (
            <div key={key} className="space-y-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-slate-800">{formatLabel(key)}</div>
              <textarea
                defaultValue={value.join(", ")}
                onChange={(e) => updateValue(key, e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
              <div className="text-xs text-slate-500">Comma-separated.</div>
            </div>
          )
        }
        if (typeof value === "object" && value !== null) {
          return (
            <div key={key} className="space-y-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-slate-800">{formatLabel(key)}</div>
              <textarea
                defaultValue={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || "{}")
                    updateValue(key, parsed)
                  } catch {
                    // keep last good state
                  }
                }}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
              />
              <div className="text-xs text-slate-500">JSON object.</div>
            </div>
          )
        }
        return (
          <div key={key} className="space-y-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm font-medium text-slate-800">{formatLabel(key)}</div>
            <input
              type="text"
              defaultValue={String(value ?? "")}
              onChange={(e) => updateValue(key, e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )
      })}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}

function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

