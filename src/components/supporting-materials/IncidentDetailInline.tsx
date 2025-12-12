import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Incident = {
  id: string
  category: string
  subtype?: string | null
  is_active: boolean
  jurisdiction?: string | null
  agency?: string | null
  court?: string | null
  case_number?: string | null
  incident_date?: string | null
  resolution_date?: string | null
  notes?: string | null
}

type Slot = {
  id: string
  incident_id: string
  slot_code: string
  status: string
}

type FileRow = {
  id: string
  system_filename: string
  version: number
  uploaded_at?: string
  is_active: boolean
  size?: number
}

type Props = {
  incident: Incident
  slots: Slot[]
  files: Record<string, FileRow[]>
  loading: boolean
  onBack: () => void
  onRefresh: () => void
}

const statusPill = (missing: number) =>
  missing > 0
    ? "bg-[#ffedd4] text-[#ca3500]"
    : "bg-green-50 text-green-700"

export function IncidentDetailInline({ incident, slots, files, loading, onBack, onRefresh }: Props) {
  const progress = useMemo(() => {
    const completed = slots.filter((s) => s.status === "uploaded").length
    const missing = Math.max(slots.length - completed, 0)
    return { completed, missing, total: slots.length }
  }, [slots])

  const codeLabel = incident.subtype ? incident.subtype.toUpperCase() : "INC-01"
  const statusLabel = progress.missing > 0 ? "In Progress" : "Complete"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to incidents">
            ←
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{codeLabel}</span>
              <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-[#1447e6]">{codeLabel}</span>
            </div>
            <div className="text-xs text-slate-600">Background Item</div>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(progress.missing)}`}>
          {statusLabel}
        </span>
      </div>

      <Card className="border border-gray-200 bg-white" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)" }}>
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4">
          <h3 className="text-[20px] font-semibold text-[#101828]">Incident Information</h3>
        </div>
        <IncidentInfoForm incident={incident} onRefresh={onRefresh} />
      </Card>

      <Card className="border border-gray-200 bg-white" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)" }}>
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4">
          <h3 className="text-[20px] font-semibold text-[#101828]">Written Explanation</h3>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-[#4a5565]">Briefly explain what happened and the outcome.</p>
          <label className="flex items-center gap-2 text-sm text-[#364153]">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            Upload an explanation instead
          </label>
          <textarea
            className="h-40 w-full rounded-lg border border-[#d1d5dc] px-4 py-3 text-sm text-slate-700"
            placeholder="Type your explanation here..."
          />
        </div>
      </Card>

      <Card className="border border-gray-200 bg-white" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1),0px 1px 2px -1px rgba(0,0,0,0.1)" }}>
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4">
          <h3 className="text-[20px] font-semibold text-[#101828]">Required Documents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {slots.map((slot, idx) => {
            const slotFiles = files[slot.id] ?? []
            const activeFile = slotFiles.find((f) => f.is_active)
            const missing = slot.status !== "uploaded"

            return (
              <div key={slot.id} className="space-y-3 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-base font-semibold text-slate-900">{slot.slot_code}</span>
                  <span className="rounded bg-[#ffedd4] px-2 py-0.5 text-[12px] text-[#ca3500]">Required</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[12px] ${
                      missing ? "bg-[#ffe2e2] text-[#c10007]" : "bg-green-100 text-[#008236]"
                    }`}
                  >
                    {missing ? "Missing" : "Uploaded"}
                  </span>
                </div>

                {activeFile && (
                  <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{activeFile.system_filename}</div>
                        <div className="text-xs text-slate-600">
                          {activeFile.uploaded_at ? new Date(activeFile.uploaded_at).toLocaleString() : ""} •{" "}
                          v{activeFile.version}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#1447e6]">
                        <button type="button" className="rounded-lg bg-blue-50 px-3 py-1">
                          History ({slotFiles.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!activeFile && <div className="text-sm text-slate-600">No file uploaded yet.</div>}

                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-[#ffd6a7] bg-orange-50 px-3 py-2 text-[#ca3500]"
                    onClick={onRefresh}
                  >
                    {missing ? "Upload" : "Replace"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-gray-100 px-3 py-2 text-[#364153]"
                    onClick={() => alert("Mark as unavailable coming soon")}
                  >
                    Mark as Unavailable
                  </button>
                </div>
              </div>
            )
          })}
          {slots.length === 0 && !loading && (
            <div className="px-6 py-5 text-sm text-slate-600">No document slots defined for this incident.</div>
          )}
          {loading && <div className="px-6 py-5 text-sm text-slate-600">Loading incident details…</div>}
        </div>
      </Card>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#364153]">{children}</p>
}

function IncidentInfoForm({ incident, onRefresh }: { incident: Incident; onRefresh: () => void }) {
  const [form, setForm] = useState({
    jurisdiction: incident.jurisdiction ?? "",
    agency: incident.agency ?? "",
    court: incident.court ?? "",
    caseNumber: incident.case_number ?? "",
    incidentDate: incident.incident_date ?? "",
    resolutionDate: incident.resolution_date ?? "",
    notes: incident.notes ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadInstead, setUploadInstead] = useState(false)
  const firstRender = React.useRef(true)

  useEffect(() => {
    setForm({
      jurisdiction: incident.jurisdiction ?? "",
      agency: incident.agency ?? "",
      court: incident.court ?? "",
      caseNumber: incident.case_number ?? "",
      incidentDate: incident.incident_date ?? "",
      resolutionDate: incident.resolution_date ?? "",
      notes: incident.notes ?? "",
    })
    setSaved(false)
    setError(null)
  }, [
    incident.id,
    incident.jurisdiction,
    incident.agency,
    incident.court,
    incident.case_number,
    incident.incident_date,
    incident.resolution_date,
    incident.notes,
  ])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      void save()
    }, 600)
    return () => clearTimeout(timer)
  }, [form])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction: form.jurisdiction || null,
          agency: form.agency || null,
          court: form.court || null,
          caseNumber: form.caseNumber || null,
          incidentDate: form.incidentDate || null,
          resolutionDate: form.resolutionDate || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.detail || j?.error || "Failed to save")
      }
      setSaved(true)
      onRefresh()
    } catch (err: any) {
      setError(err?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 px-6 py-5">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{saving ? "Saving…" : saved ? "Saved" : " "}</span>
        {error && <span className="text-red-600">{error}</span>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Jurisdiction"
          placeholder="Salt Lake County"
          value={form.jurisdiction}
          onChange={(v) => setForm((f) => ({ ...f, jurisdiction: v }))}
        />
        <InputField
          label="Agency / Court"
          placeholder="District Court"
          value={form.agency || form.court || ""}
          onChange={(v) => setForm((f) => ({ ...f, agency: v, court: v }))}
        />
        <InputField
          label="Case/Reference #"
          placeholder="2019-CR-12345"
          value={form.caseNumber}
          onChange={(v) => setForm((f) => ({ ...f, caseNumber: v }))}
        />
        <InputField
          label="Incident Date"
          type="date"
          value={form.incidentDate ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, incidentDate: v }))}
        />
        <InputField
          label="Resolution Date"
          type="date"
          value={form.resolutionDate ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, resolutionDate: v }))}
        />
      </div>
      <div>
        <Label>Notes</Label>
        <textarea
          className="mt-2 h-24 w-full rounded-lg border border-[#d1d5dc] px-4 py-3 text-sm text-slate-700"
          placeholder="Optional internal notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-[#364153]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={uploadInstead}
            onChange={(e) => setUploadInstead(e.target.checked)}
          />
          Upload an explanation instead
        </label>
        <textarea
          className="mt-3 h-24 w-full rounded-lg border border-[#d1d5dc] px-4 py-3 text-sm text-slate-700"
          placeholder="Type your explanation here..."
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-[#d1d5dc] px-3 text-sm text-slate-800"
      />
    </div>
  )
}

