import * as React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Incident = {
  id: string
  category: string
  subtype?: string | null
  is_active: boolean
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
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
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
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Jurisdiction" value="Salt Lake County" />
            <Field label="Agency / Court" value="District Court" muted />
            <Field label="Case/Reference #" value="2019-CR-12345" />
            <Field label="Incident Date" value="MM/DD/YYYY" muted />
            <Field label="Resolution Date" value="" />
          </div>
          <div>
            <Label>Notes</Label>
            <div className="mt-2 rounded-lg border border-[#d1d5dc] px-4 py-3 text-[16px] text-[rgba(10,10,10,0.5)]">
              Optional internal notes
            </div>
          </div>
        </div>
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

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`rounded-lg border border-[#d1d5dc] px-4 py-3 text-[16px] ${
          muted ? "text-[rgba(10,10,10,0.5)]" : "text-neutral-950"
        }`}
      >
        {value || " "}
      </div>
    </div>
  )
}

