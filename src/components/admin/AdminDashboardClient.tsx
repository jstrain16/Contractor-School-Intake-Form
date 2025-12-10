"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { WizardData } from "@/lib/schemas"
import { AdminSectionBlock } from "@/components/admin/AdminSectionBlock"
import { ReminderActions } from "@/components/admin/ReminderActions"
import { AttachmentList } from "@/components/admin/AttachmentList"

type ApplicationRow = {
  id: string
  user_id: string
  data: WizardData | null
  updated_at: string | null
  created_at: string | null
  primary_trade: string | null
  license_type: string | null
  archived?: boolean | null
}

type ProfileRow = {
  user_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type AttachmentRow = {
  id: string
  application_id: string
  path: string
  bucket: string
  file_type: string | null
  metadata: Record<string, unknown> | null
  created_at: string | null
}

type AdminAttachment = AttachmentRow & { signedUrl: string | null }
type AdminRow = { app: ApplicationRow; profile?: ProfileRow; progress: number; attachments: AdminAttachment[] }

type StatusKind = "ready" | "progress" | "approved" | "needs-revision"

function classify(progress: number): StatusKind {
  if (progress >= 100) return "approved"
  if (progress >= 80) return "ready"
  if (progress >= 50) return "progress"
  return "needs-revision"
}

function statusChip(kind: StatusKind) {
  const map: Record<StatusKind, { label: string; bg: string; text: string }> = {
    ready: { label: "Ready for Review", bg: "bg-blue-100", text: "text-blue-700" },
    progress: { label: "In Progress", bg: "bg-amber-100", text: "text-amber-800" },
    approved: { label: "Approved", bg: "bg-green-100", text: "text-green-700" },
    "needs-revision": { label: "Needs Revision", bg: "bg-rose-100", text: "text-rose-700" },
  }
  return map[kind]
}

function getName(profile?: ProfileRow, data?: WizardData | null) {
  const step0 = data?.step0
  const nameParts = [profile?.first_name ?? step0?.firstName ?? "", profile?.last_name ?? step0?.lastName ?? ""].filter(
    Boolean
  )
  const name = nameParts.join(" ") || profile?.email || step0?.email || "Unknown user"
  const email = profile?.email ?? step0?.email ?? "No email"
  return { name, email }
}

function formatKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    if (value.length === 0) return "—"
    return value.map((v, i) => (
      <span key={i}>
        {formatValue(v)}
        {i < value.length - 1 ? ", " : ""}
      </span>
    ))
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return "—"
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={k}>
            <span className="font-medium">{formatKey(k)}:</span> {formatValue(v)}
          </div>
        ))}
      </div>
    )
  }
  return String(value)
}

function renderSection(label: string, data?: Record<string, unknown> | null) {
  const entries = Object.entries(data || {}).filter(([, v]) => v !== undefined)
  return (
    <details className="border rounded-md p-3 bg-slate-50">
      <summary className="cursor-pointer text-sm font-medium text-slate-800">{label}</summary>
      <div className="mt-3 space-y-3 text-sm">
        {entries.length === 0 && <div className="text-slate-600">No responses</div>}
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatKey(k)}</div>
            <div className="mt-1 text-slate-900">{formatValue(v)}</div>
          </div>
        ))}
      </div>
    </details>
  )
}

export function AdminDashboardClient({ rows }: { rows: AdminRow[] }) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"recent" | "my">("recent")
  const [selected, setSelected] = useState<AdminRow | null>(null)

  const classifiedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        status: classify(r.progress),
      })),
    [rows]
  )

  const stats = useMemo(() => {
    const totals = { progress: 0, ready: 0, approved: 0, needsRevision: 0 }
    classifiedRows.forEach((r) => {
      if (r.status === "approved") totals.approved += 1
      else if (r.status === "ready") totals.ready += 1
      else if (r.status === "needs-revision") totals.needsRevision += 1
      else totals.progress += 1
    })
    return totals
  }, [classifiedRows])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = classifiedRows
    const byTab = activeTab === "recent" ? base : base // no assignment concept yet
    if (!q) return byTab
    return byTab.filter(({ app, profile }) => {
      const step0 = app.data?.step0
      const haystack = [
        profile?.first_name,
        profile?.last_name,
        step0?.firstName,
        step0?.lastName,
        profile?.email,
        step0?.email,
        app.primary_trade,
        app.license_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [activeTab, classifiedRows, query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-500">Last 30 days</div>
            <div className="text-4xl font-bold text-slate-900">{stats.progress}</div>
            <div className="text-sm text-slate-600">In Progress</div>
            <div className="text-sm font-semibold text-orange-600">+3 this week</div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-500">Needs attention</div>
            <div className="text-4xl font-bold text-slate-900">{stats.ready}</div>
            <div className="text-sm text-slate-600">Ready for Review</div>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              onClick={() => setActiveTab("recent")}
            >
              Review now →
            </button>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-500">All time</div>
            <div className="text-4xl font-bold text-slate-900">{stats.approved}</div>
            <div className="text-sm text-slate-600">Approved</div>
            <div className="text-sm font-semibold text-green-600">+12 this month</div>
          </div>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-500">Awaiting action</div>
            <div className="text-4xl font-bold text-slate-900">{stats.needsRevision}</div>
            <div className="text-sm text-slate-600">Needs Revision</div>
            <div className="text-sm font-semibold text-rose-600">Pending applicant</div>
          </div>
        </Card>
      </div>

      {/* Table controls */}
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={activeTab === "recent" ? "outline" : "ghost"}
              className={`rounded-full px-4 ${activeTab === "recent" ? "bg-orange-100 text-orange-800" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              Recent Applications <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-orange-700">{rows.length}</span>
            </Button>
            <Button
              variant={activeTab === "my" ? "outline" : "ghost"}
              className={`rounded-full px-4 ${activeTab === "my" ? "bg-slate-100 text-slate-800" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Queue <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-700">0</span>
            </Button>
          </div>
          <div className="flex flex-1 items-center gap-3 md:flex-none">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search applications..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none"
              />
              <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
            <Button variant="outline" className="rounded-lg border-slate-200 text-slate-800">
              Filter
            </Button>
            <Button className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Business Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Assigned Admin</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-800">
              {filtered.map(({ app, profile, progress, status }) => {
                const user = getName(profile, app.data)
                const chip = statusChip(status)
                const assigned = "Mike Davis" // placeholder until assignment exists
                const updated =
                  app.updated_at ? new Date(app.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"
                return (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold">{app.primary_trade || "—"}</div>
                        <div className="text-xs text-slate-500">{app.license_type || "—"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${chip.bg} ${chip.text}`}>
                        {chip.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full ${status === "approved" ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-orange-600"}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-sm font-semibold text-slate-800">{Math.round(progress)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">A</div>
                        <div>
                          <div className="font-semibold text-slate-900">{assigned}</div>
                          <div className="text-xs text-slate-500">Admin</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{updated}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        className="text-slate-700 hover:bg-slate-100"
                        onClick={() => setSelected({ app, profile, progress, attachments })}
                      >
                        View details
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-500" colSpan={7}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-600">
          <div>Showing {filtered.length} of {rows.length} applications</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-lg border-slate-200 text-slate-800">
              Previous
            </Button>
            <Button className="rounded-lg bg-orange-500 text-white hover:bg-orange-600">Next</Button>
          </div>
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{getName(selected.profile, selected.app.data).name}</div>
                <div className="text-sm text-slate-600">{getName(selected.profile, selected.app.data).email}</div>
              </div>
              <Button variant="ghost" onClick={() => setSelected(null)} className="text-slate-700">
                Close
              </Button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  Progress: {Math.round(selected.progress)}%
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  Primary Trade: {selected.app.primary_trade || "—"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  License Type: {selected.app.license_type || "—"}
                </span>
              </div>

              <div className="space-y-2">
                <AdminSectionBlock
                  label="License Setup & Basic Info"
                  sectionKey="step0"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step0 as Record<string, unknown>}
                >
                  {renderSection("License Setup & Basic Info", (selected.app.data?.step0 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Pre-Licensure / Education"
                  sectionKey="step1"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step1 as Record<string, unknown>}
                >
                  {renderSection("Pre-Licensure / Education", (selected.app.data?.step1 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Business Entity, FEIN & Banking"
                  sectionKey="step2"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step2 as Record<string, unknown>}
                >
                  {renderSection("Business Entity, FEIN & Banking", (selected.app.data?.step2 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Insurance"
                  sectionKey="step3"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step3 as Record<string, unknown>}
                >
                  {renderSection("Insurance", (selected.app.data?.step3 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Experience & Qualifier"
                  sectionKey="step4"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step4 as Record<string, unknown>}
                >
                  {renderSection("Experience & Qualifier", (selected.app.data?.step4 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Exams (Business & Law)"
                  sectionKey="step5"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step5 as Record<string, unknown>}
                >
                  {renderSection("Exams (Business & Law)", (selected.app.data?.step5 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="DOPL Application"
                  sectionKey="step6"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step6 as Record<string, unknown>}
                >
                  {renderSection("DOPL Application", (selected.app.data?.step6 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Review / Attestation"
                  sectionKey="step7"
                  applicationId={selected.app.id}
                  data={selected.app.data?.step7 as Record<string, unknown>}
                >
                  {renderSection("Review / Attestation", (selected.app.data?.step7 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
              </div>

              <ReminderActions applicationId={selected.app.id} data={selected.app.data ?? {}} email={selected.profile?.email ?? selected.app.data?.step0?.email ?? null} />

              <AttachmentList attachments={selected.attachments} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

