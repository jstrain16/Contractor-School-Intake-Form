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
  DollarSign,
  Send,
} from "lucide-react"
import { AdminSectionBlock } from "@/components/admin/AdminSectionBlock"
import { ReminderActions } from "@/components/admin/ReminderActions"
import { AttachmentList } from "@/components/admin/AttachmentList"
import { buildStatus, getMissingSteps } from "@/lib/progress"
import { useState as useReactState } from "react"
import { LoaderThree } from "@/components/ui/loader"

type ApplicationRow = {
  id: string
  user_id: string
  data: any | null
  updated_at: string | null
  created_at: string | null
  primary_trade: string | null
  license_type: string | null
  archived?: boolean | null
}

function InlineSectionEditor({
  applicationId,
  sectionKey,
  phaseId,
  completed,
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
  attachmentMap,
}: {
  applicationId: string
  sectionKey: string
  phaseId?: number
  completed?: boolean
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
  attachmentMap: Map<string, string>
}) {
  const editing = editingSection === sectionKey
  const saving = savingSection === sectionKey
  const saved = savedSection === sectionKey
  const [markComplete, setMarkComplete] = useState<boolean>(Boolean(completed))

  const handleSave = async () => {
    setSavingSection(sectionKey)
    setSavedSection(null)
    try {
      const res = await fetch("/api/admin/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          sectionKey,
          data: editFormData,
          phaseId,
          markComplete,
        }),
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
    <div className="flex items-center gap-3 flex-wrap">
      {typeof phaseId === "number" && (
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={markComplete}
            onChange={(e) => setMarkComplete(e.target.checked)}
            className="h-4 w-4"
          />
          Mark phase complete
        </label>
      )}
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

function getName(profile?: ProfileRow, data?: any | null) {
  const phase1 = data?.phase1 || data?.formData || {}
  const nameParts = [profile?.first_name ?? phase1.firstName ?? "", profile?.last_name ?? phase1.lastName ?? ""].filter(Boolean)
  const name = nameParts.join(" ") || profile?.email || phase1.email || "Unknown user"
  const email = profile?.email ?? phase1.email ?? "No email"
  return { name, email }
}

function formatKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function uploadAdminAttachment({
  file,
  applicationId,
  sectionKey,
  fieldKey,
}: {
  file: File
  applicationId: string
  sectionKey: string
  fieldKey: string
}) {
  const form = new FormData()
  form.append("file", file)
  form.append("applicationId", applicationId)
  form.append("fileType", `${sectionKey}.${fieldKey}`)
  form.append("phaseKey", sectionKey)
  form.append("fieldKey", fieldKey)
  const res = await fetch("/api/admin/application/upload", {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Upload failed")
  }
  const json = await res.json()
  return json.attachment as {
    id: string
    bucket: string
    path: string
    originalName: string
    fileType?: string
    uploadedAt?: string
  }
}

function renderEditableSection(
  data: Record<string, unknown>,
  onChange: (next: Record<string, unknown>) => void,
  attachmentMap: Map<string, string>,
  applicationId: string,
  sectionKey: string
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
          const valObj = value as Record<string, unknown>
          const isAttachment = "path" in valObj || "bucket" in valObj || "id" in valObj
          if (isAttachment) {
            const attId = typeof valObj.id === "string" ? valObj.id : undefined
            const signedUrl = attId ? attachmentMap.get(attId) : undefined
            return (
              <div key={key} className="space-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-sm font-medium text-slate-800">{formatKey(key)}</div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  {signedUrl ? (
                    <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                      Download
                    </a>
                  ) : (
                    <span className="text-slate-500">No download</span>
                  )}
                  {valObj.path ? <span className="text-slate-400 truncate">{String(valObj.path)}</span> : null}
                </div>
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const att = await uploadAdminAttachment({ file, applicationId, sectionKey, fieldKey: key })
                      updateValue(key, att)
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />
              </div>
            )
          }
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

function formatValue(value: unknown, attachmentMap: Map<string, string>): React.ReactNode {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    if (value.length === 0) return "—"
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {formatValue(v, attachmentMap)}
            {i < value.length - 1 ? <span className="text-slate-400">,</span> : null}
          </span>
        ))}
      </div>
    )
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const isAttachment = "id" in obj || "path" in obj || "bucket" in obj
    if (isAttachment) {
      const attId = typeof obj.id === "string" ? obj.id : undefined
      const signed = attId ? attachmentMap.get(attId) : undefined
      const label = (obj as any).originalName || (obj as any).path || "attachment"
      return (
        <div className="flex items-center gap-2 text-xs">
          {signed ? (
            <a href={signed} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Download {label}
            </a>
          ) : (
            <span className="text-slate-500">{String(label)}</span>
          )}
        </div>
      )
    }
    const entries = Object.entries(obj)
    if (entries.length === 0) return "—"
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={k}>
            <span className="font-medium">{formatKey(k)}:</span> {formatValue(v, attachmentMap)}
          </div>
        ))}
      </div>
    )
  }
  return String(value)
}

function renderSectionContent(data: Record<string, unknown> | null | undefined, attachmentMap: Map<string, string>) {
  const entries = Object.entries(data || {}).filter(([, v]) => v !== undefined)
  return (
    <div className="space-y-3 text-sm">
        {entries.length === 0 && <div className="text-slate-600">No responses</div>}
        {entries.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatKey(k)}</div>
            <div className="mt-1 text-slate-900">{formatValue(v, attachmentMap)}</div>
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
  const attachmentMap = useMemo(() => {
    const m = new Map<string, string>()
    rows.forEach((r) => {
      r.attachments?.forEach((a) => {
        if (a.id) m.set(a.id, a.signedUrl ?? "")
      })
    })
    return m
  }, [rows])
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
              {loadingAdmins && <div className="flex justify-center py-4"><LoaderThree /></div>}
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
                { key: "phase1", label: "Authentication", desc: "User info and contact", color: "text-blue-600", bg: "bg-blue-50", icon: User, id: 1 },
                { key: "phase2", label: "License Type", desc: "License classification", color: "text-emerald-600", bg: "bg-emerald-50", icon: ClipboardCheck, id: 2 },
                { key: "phase3", label: "Class Booking", desc: "Select and pay for class", color: "text-indigo-600", bg: "bg-indigo-50", icon: GraduationCap, id: 3 },
                { key: "phase4", label: "Screening", desc: "Criminal & financial screening", color: "text-amber-600", bg: "bg-amber-50", icon: Shield, id: 4 },
                { key: "phase5", label: "Assistance", desc: "Support package", color: "text-pink-600", bg: "bg-pink-50", icon: DollarSign, id: 5 },
                { key: "phase6", label: "Business Setup", desc: "Entity, FEIN, banking", color: "text-green-600", bg: "bg-green-50", icon: Building2, id: 6 },
                { key: "phase7", label: "Qualifier", desc: "Qualifier details", color: "text-slate-600", bg: "bg-slate-100", icon: Briefcase, id: 7 },
                { key: "phase8", label: "Insurance Prep", desc: "Insurance setup", color: "text-purple-600", bg: "bg-purple-50", icon: Shield, id: 8 },
                { key: "phase9", label: "WC Waiver Prep", desc: "Workers comp waiver", color: "text-rose-600", bg: "bg-rose-50", icon: ClipboardList, id: 9 },
                { key: "phase10", label: "Class Complete", desc: "Attendance verified", color: "text-sky-600", bg: "bg-sky-50", icon: BadgeCheck, id: 10 },
                { key: "phase11", label: "Exam", desc: "Exam status", color: "text-lime-600", bg: "bg-lime-50", icon: FileText, id: 11 },
                { key: "phase12", label: "Insurance Active", desc: "Coverage activation", color: "text-cyan-600", bg: "bg-cyan-50", icon: Shield, id: 12 },
                { key: "phase13", label: "WC Submit", desc: "Waiver submission", color: "text-orange-600", bg: "bg-orange-50", icon: ClipboardCheck, id: 13 },
                { key: "phase14", label: "DOPL Assembly", desc: "Application package", color: "text-slate-700", bg: "bg-slate-100", icon: FileText, id: 14 },
                { key: "phase15", label: "Review", desc: "Staff review", color: "text-teal-600", bg: "bg-teal-50", icon: CheckCircle, id: 15 },
                { key: "phase16", label: "Submission", desc: "Submit to DOPL", color: "text-fuchsia-600", bg: "bg-fuchsia-50", icon: Send, id: 16 },
                { key: "phase17", label: "Tracking", desc: "Status updates", color: "text-gray-700", bg: "bg-gray-100", icon: Clock, id: 17 },
              ].map((section) => {
                const completed = Array.isArray(selected.app.data?.completedPhases)
                  ? (selected.app.data?.completedPhases as number[]).includes(section.id)
                  : false
                const activePhase = typeof selected.app.data?.active_phase === "number" ? selected.app.data.active_phase : 1
                const started = completed || activePhase >= section.id
                const sectionData = selected.app.data?.[section.key]
                const hasData = sectionData && Object.keys(sectionData as Record<string, unknown>).length > 0
                const StatusIcon = () =>
                  completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : started ? <Clock className="h-4 w-4 text-orange-500" /> : <Clock className="h-4 w-4 text-slate-400" />
                const Icon = section.icon
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
                        sectionKey={section.key}
                        phaseId={section.id}
                        completed={completed}
                        data={selected.app.data?.[section.key] as Record<string, unknown>}
                        editingSection={editingSection}
                        setEditingSection={setEditingSection}
                        editFormData={editFormData}
                        setEditFormData={setEditFormData}
                        savingSection={savingSection}
                        setSavingSection={setSavingSection}
                        savedSection={savedSection}
                        setSavedSection={setSavedSection}
                        attachmentMap={attachmentMap}
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
                          sectionKey={section.key as any}
                          applicationId={selected.app.id}
                          data={selected.app.data?.[section.key] as Record<string, unknown>}
                      simple
                        >
                      {editingSection === section.key ? (
                        renderEditableSection(editFormData, setEditFormData, attachmentMap, selected.app.id, section.key)
                      ) : (
                        renderSectionContent((selected.app.data?.[section.key] as Record<string, unknown>) || {}, attachmentMap)
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
                      <div className="font-semibold">Missing phases:</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600">
                        {[
                          { id: 4, label: "Screening" },
                          { id: 6, label: "Business Setup" },
                          { id: 8, label: "Insurance Prep" },
                          { id: 9, label: "WC Waiver Prep" },
                          { id: 16, label: "Submission" },
                        ].map((p) => {
                          const done = Array.isArray(selected.app.data?.completedPhases)
                            ? (selected.app.data.completedPhases as number[]).includes(p.id)
                            : false
                          return (
                            <li key={p.id} className={done ? "line-through text-slate-400" : ""}>
                              {p.label} {done ? "(complete)" : ""}
                            </li>
                          )
                        })}
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

