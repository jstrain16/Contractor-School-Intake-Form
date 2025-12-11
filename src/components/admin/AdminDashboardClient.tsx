"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  User,
  Briefcase,
  CheckCircle2,
  Mail,
  AlertCircle,
  Eye,
  Download,
  X,
  ClipboardList,
  Shield,
  GraduationCap,
  Building2,
  FileText,
  BadgeCheck,
  ClipboardCheck,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { WizardData } from "@/lib/schemas"
import { AdminSectionBlock } from "@/components/admin/AdminSectionBlock"
import { ReminderActions } from "@/components/admin/ReminderActions"
import { AttachmentList } from "@/components/admin/AttachmentList"
import { buildStatus, getMissingSteps } from "@/lib/progress"
import { useState as useReactState } from "react"

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

function InlineSectionEditor({
  applicationId,
  sectionKey,
  data,
  editingSection,
  setEditingSection,
  editFormData,
  setEditFormData,
  savingSection,
  setSavingSection,
  savedSection,
  setSavedSection,
  onSaved,
}: {
  applicationId: string
  sectionKey: keyof WizardData
  data?: Record<string, unknown>
  editingSection: string | null
  setEditingSection: (k: string | null) => void
  editFormData: Record<string, unknown>
  setEditFormData: (d: Record<string, unknown>) => void
  savingSection: string | null
  setSavingSection: (k: string | null) => void
  savedSection: string | null
  setSavedSection: (k: string | null) => void
  onSaved: (updated: Record<string, unknown>) => void
}) {
  const editing = editingSection === sectionKey
  const saving = savingSection === sectionKey
  const saved = savedSection === sectionKey

  const handleSave = async () => {
    setSavingSection(sectionKey)
    setSavedSection(null)
    try {
      const res = await fetch("/api/admin/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, sectionKey, data: editFormData }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to save")
      }
      setSavedSection(sectionKey)
      onSaved(editFormData)
      setEditingSection(null)
      setTimeout(() => setSavedSection(null), 1500)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingSection(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={editing ? "default" : "outline"}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (editing) {
            handleSave()
          } else {
            setEditFormData(data || {})
            setEditingSection(sectionKey)
          }
        }}
        disabled={saving}
      >
        {saving ? "Saving..." : editing ? "Save" : saved ? "Saved!" : "Edit"}
      </Button>
    </div>
  )
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

function renderEditableSection(
  data: Record<string, unknown>,
  onChange: (next: Record<string, unknown>) => void
) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) return <div className="text-slate-600 text-sm">No fields to edit.</div>

  const updateValue = (key: string, value: unknown) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-3 text-sm">
      {entries.map(([key, value]) => {
        if (typeof value === "boolean") {
          return (
            <label
              key={key}
              className="flex items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
            >
              <span className="text-sm font-medium text-slate-800">{formatKey(key)}</span>
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
              <div className="text-sm font-medium text-slate-800">{formatKey(key)}</div>
              <input
                type="number"
                value={value}
                onChange={(e) => updateValue(key, Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )
        }
        if (typeof value === "object" && value !== null) {
          return (
            <div key={key} className="space-y-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-slate-800">{formatKey(key)}</div>
              <textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || "{}")
                    updateValue(key, parsed)
                  } catch {
                    // ignore parse errors
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
            <div className="text-sm font-medium text-slate-800">{formatKey(key)}</div>
            <input
              type="text"
              value={String(value ?? "")}
              onChange={(e) => updateValue(key, e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )
      })}
    </div>
  )
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

function renderSectionContent(data?: Record<string, unknown> | null) {
  const entries = Object.entries(data || {}).filter(([, v]) => v !== undefined)
  return (
    <div className="space-y-3 text-sm">
        {entries.length === 0 && <div className="text-slate-600">No responses</div>}
        {entries.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatKey(k)}</div>
            <div className="mt-1 text-slate-900">{formatValue(v)}</div>
          </div>
        ))}
      </div>
  )
}

export function AdminDashboardClient({
  rows,
  currentAdminId,
  currentAdminEmail,
  currentAdminProfileId,
}: {
  rows: AdminRow[]
  currentAdminId?: string | null
  currentAdminEmail?: string | null
  currentAdminProfileId?: string | null
}) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"recent" | "my">("recent")
  const [selected, setSelected] = useState<AdminRow | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<string>("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [assignOpen, setAssignOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [admins, setAdmins] = useState<{ id: string; name: string; email: string | null; role?: string }[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [adminMap, setAdminMap] = useState<Map<string, { name: string; email: string | null; role?: string }>>(new Map())
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Record<string, unknown>>({})
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  const classifiedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        status: classify(r.progress),
        assigned_admin_email: (r.app as any).assigned_admin_email,
        assigned_admin_id: (r.app as any).assigned_admin_id,
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

  const statCards = useMemo(
    () => [
      {
        label: "Last 30 days",
        value: stats.progress,
        subtitle: "In Progress",
        accent: "orange",
        delta: "+3 this week",
      },
      {
        label: "Needs attention",
        value: stats.ready,
        subtitle: "Ready for Review",
        accent: "blue",
        cta: () => setActiveTab("recent"),
        ctaLabel: "Review now →",
      },
      {
        label: "All time",
        value: stats.approved,
        subtitle: "Approved",
        accent: "green",
        delta: "+12 this month",
      },
      {
        label: "Awaiting action",
        value: stats.needsRevision,
        subtitle: "Needs Revision",
        accent: "rose",
        delta: "Pending applicant",
      },
    ],
    [stats, setActiveTab]
  )

  const isAssignedToMe = (row: (typeof classifiedRows)[number]) => {
    const assignedId = (row.app as any).assigned_admin_id as string | null
    return Boolean(currentAdminProfileId && assignedId && assignedId === currentAdminProfileId)
  }

  const myQueueRows = useMemo(() => classifiedRows.filter(isAssignedToMe), [classifiedRows, currentAdminProfileId])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = activeTab === "my" ? myQueueRows : classifiedRows
    if (!q) return base
    return base.filter(({ app, profile }) => {
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
  }, [activeTab, classifiedRows, myQueueRows, query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!selected) return
    const { name } = getName(selected.profile, selected.app.data)
    setEmailDraft(
      `Hi ${name}, you're almost done with your contractor license application! Just two more steps to complete: add workers comp (or a waiver if no employees) and complete the final review/attestation. Reply here if you need help.`
    )
  }, [selected])

  // Prefetch admins for display
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const res = await fetch("/api/admin/users/list")
        if (!res.ok) return
        const data = await res.json()
        const list = (data.admins || []) as { id: string; name: string; email: string | null; role?: string }[]
        setAdmins(list)
        const map = new Map<string, { name: string; email: string | null; role?: string }>()
        list.forEach((a) => map.set(a.id, { name: a.name, email: a.email, role: a.role }))
        setAdminMap(map)
      } catch (e) {
        console.error("load admins failed", e)
      }
    }
    loadAdmins()
  }, [])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map((r) => r.app.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const openAssign = async () => {
    setAssignOpen(true)
    setLoadingAdmins(true)
    try {
      const res = await fetch("/api/admin/users/list")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins || [])
      }
    } catch (e) {
      console.error("Failed to load admins", e)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const assignSelected = async () => {
    if (!selectedAdminId || selectedIds.size === 0) return
    setAssigning(true)
    try {
      const res = await fetch("/api/admin/applications/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: Array.from(selectedIds), adminId: selectedAdminId }),
      })
      if (!res.ok) {
        console.error("Assign failed", await res.text())
        return
      }
      setAssignOpen(false)
      // refresh to show new assignments
      window.location.reload()
    } catch (e) {
      console.error("Assign error", e)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const accentMap: Record<string, { bg: string; text: string; border: string }> = {
            orange: { bg: "bg-orange-100", text: "text-orange-700", border: "text-orange-600" },
            blue: { bg: "bg-blue-100", text: "text-blue-700", border: "text-blue-600" },
            green: { bg: "bg-green-100", text: "text-green-700", border: "text-green-600" },
            rose: { bg: "bg-rose-100", text: "text-rose-700", border: "text-rose-600" },
          }
          const colors = accentMap[card.accent] || accentMap.orange
          return (
            <Card key={card.label} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                    <ClipboardList className="h-6 w-6" />
          </div>
                  <div className="text-xs font-semibold uppercase text-slate-500">{card.label}</div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{card.value}</div>
                <div className="text-sm text-slate-600">{card.subtitle}</div>
                {card.delta && <div className={`text-sm font-semibold ${colors.border}`}>{card.delta}</div>}
                {card.cta && card.ctaLabel && (
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    onClick={card.cta}
            >
                    {card.ctaLabel}
            </button>
                )}
          </div>
        </Card>
          )
        })}
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
              My Queue <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-700">{myQueueRows.length}</span>
            </Button>
            {selectedIds.size > 0 && (
              <Button
                className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-sm hover:bg-orange-600"
                onClick={openAssign}
              >
                Assign to admin
              </Button>
            )}
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
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
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
              {filtered.map(({ app, profile, progress, status, attachments }) => {
                const user = getName(profile, app.data)
                const chip = statusChip(status)
                const assignedId = (app as any).assigned_admin_id as string | null
                const adminFromMap = assignedId ? adminMap.get(assignedId) : undefined
                const assignedDisplay = adminFromMap?.name || "Unassigned"
                const assignedInitials = (adminFromMap?.name || "NA").slice(0, 2).toUpperCase()
                const updated =
                  app.updated_at ? new Date(app.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"
                return (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                      />
                    </td>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
                          {assignedInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{assignedDisplay}</div>
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
                  <td className="px-6 py-10 text-center text-slate-500" colSpan={8}>
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

      {/* Assign modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Assign to admin</div>
                <div className="text-sm text-slate-600">Select an admin or super admin to assign {selectedIds.size} application(s).</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAssignOpen(false)} className="text-slate-600">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-3">
              {loadingAdmins && <div className="text-sm text-slate-600">Loading admins...</div>}
              {!loadingAdmins && admins.length === 0 && (
                <div className="text-sm text-slate-600">No admins found.</div>
              )}
              {!loadingAdmins &&
                admins.map((adm) => (
                  <button
                    key={adm.id}
                    type="button"
                    onClick={() => setSelectedAdminId(adm.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left shadow-sm ${
                      selectedAdminId === adm.id ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {(adm.name || adm.email || "?").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{adm.name}</div>
                        <div className="text-xs text-slate-600">{adm.email}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold uppercase text-slate-500">{adm.role || "admin"}</div>
                  </button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button variant="outline" className="border-slate-200 text-slate-800" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={!selectedAdminId || selectedIds.size === 0 || assigning}
                onClick={assignSelected}
              >
                {assigning ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            {/* Orange header */}
            <div className="relative rounded-t-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 pb-6 pt-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner shadow-orange-900/20">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold leading-tight">{getName(selected.profile, selected.app.data).name}</div>
                    <div className="text-sm text-white/80">APP-{selected.app.id?.slice(0, 4).toUpperCase() || "ID"}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Top stats cards */}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <div className="text-sm text-white/80">Progress</div>
                  <div className="text-3xl font-bold">{Math.round(selected.progress)}%</div>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <div className="text-sm text-white/80">Primary Trade</div>
                  <div className="text-lg font-semibold">{selected.app.primary_trade || "—"}</div>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <div className="text-sm text-white/80">License Type</div>
                  <div className="text-lg font-semibold">{selected.app.license_type || "—"}</div>
                </div>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-2 bg-white px-4 py-5 max-h-[70vh] overflow-y-auto">
              {[
                { key: "step0", label: "License Setup & Basic Info", desc: "Complete your profile and license details", color: "text-blue-600", bg: "bg-blue-50" },
                { key: "step1", label: "Pre-Licensure / Education", desc: "Upload course completion or exemptions", color: "text-purple-600", bg: "bg-purple-50" },
                { key: "step2", label: "Business Entity, FEIN & Banking", desc: "Business structure and tax information", color: "text-green-600", bg: "bg-green-50" },
                { key: "step3", label: "Insurance", desc: "General liability and workers comp coverage", color: "text-slate-600", bg: "bg-slate-100" },
                { key: "step4", label: "Experience & Qualifier", desc: "Document qualifier experience if required", color: "text-amber-600", bg: "bg-amber-50" },
                { key: "step5", label: "Exams (Business & Law)", desc: "Pass the Business & Law exam or provide specialty proof", color: "text-pink-600", bg: "bg-pink-50" },
              ].map((section, idx) => {
                // determine status icon
                const sectionData = selected.app.data?.[section.key as keyof WizardData]
                const hasData = sectionData && Object.keys(sectionData as Record<string, unknown>).length > 0
                const isPending = section.key === "step3" && !hasData
                const StatusIcon = () =>
                  isPending ? <Clock className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-600" />
                const Icon = (() => {
                  switch (section.key) {
                    case "step0":
                      return ClipboardList
                    case "step1":
                      return GraduationCap
                    case "step2":
                      return Building2
                    case "step3":
                      return Shield
                    case "step4":
                      return Briefcase
                    case "step5":
                    default:
                      return FileText
                  }
                })()
                return (
                  <Card
                    key={section.key}
                    className="border border-slate-200 bg-white shadow-sm rounded-2xl"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-3 text-left"
                      onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${section.bg} ${section.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{section.label}</div>
                          <div className="text-xs text-slate-600">{section.desc}</div>
                        </div>
                      </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    {expandedSection === section.key && (
                      <InlineSectionEditor
                        applicationId={selected.app.id}
                        sectionKey={section.key as keyof WizardData}
                        data={selected.app.data?.[section.key as keyof WizardData] as Record<string, unknown>}
                        editingSection={editingSection}
                        setEditingSection={setEditingSection}
                        editFormData={editFormData}
                        setEditFormData={setEditFormData}
                        savingSection={savingSection}
                        setSavingSection={setSavingSection}
                        savedSection={savedSection}
                        setSavedSection={setSavedSection}
                        onSaved={async (updated) => {
                          setSelected((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  app: {
                                    ...prev.app,
                                    data: {
                                      ...(prev.app.data || {}),
                                      [section.key]: updated,
                                    } as any,
                                  },
                                }
                              : prev
                          )
                        }}
                      />
                    )}
                        <StatusIcon />
                        {expandedSection === section.key ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                    {expandedSection === section.key && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <AdminSectionBlock
                          label={section.label}
                          sectionKey={section.key as keyof WizardData}
                          applicationId={selected.app.id}
                          data={selected.app.data?.[section.key as keyof WizardData] as Record<string, unknown>}
                      simple
                        >
                      {editingSection === section.key ? (
                        renderEditableSection(editFormData, setEditFormData)
                      ) : (
                        renderSectionContent(
                          (selected.app.data?.[section.key as keyof WizardData] as Record<string, unknown>) || {}
                        )
                      )}
                        </AdminSectionBlock>
                      </div>
                    )}
                  </Card>
                )
              })}

              {/* Reminder Email block */}
              <Card className="mt-3 border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-600" />
                  <div className="text-sm font-semibold text-slate-900">Reminder Email</div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                    <div>
                      <div className="font-semibold">Missing steps:</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600">
                        {!selected.app.data?.step3 && (
                          <li>Insurance: Add workers comp or waiver if no employees</li>
                        )}
                        {!selected.app.data?.step7 && <li>Review / Attestation: Complete final review and sign</li>}
                        {selected.app.data?.step3 && selected.app.data?.step7 && (
                          <li>All required steps have submissions</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900">Email draft</div>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-500 focus:outline-none"
                      rows={3}
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-semibold">
                    <Button variant="outline" className="border-slate-200 text-slate-800">
                      Generate AI Draft
                    </Button>
                    <Button className="bg-orange-500 text-white hover:bg-orange-600">Send Email</Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">Send via AI Now</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-white px-4 py-4">
              <Button className="bg-green-600 text-white hover:bg-green-700">Approve Application</Button>
              <Button variant="outline" className="border-slate-200 text-slate-800">
                Contact
              </Button>
              <Button className="bg-amber-500 text-white hover:bg-amber-600">Request Revision</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

