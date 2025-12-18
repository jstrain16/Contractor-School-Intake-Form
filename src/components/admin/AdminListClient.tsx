"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AdminSectionBlock } from "@/components/admin/AdminSectionBlock"
import { ReminderActions } from "@/components/admin/ReminderActions"
import { AttachmentList } from "@/components/admin/AttachmentList"
import type { WizardData } from "@/lib/schemas"

function SalesforceIndicator({ email }: { email: string | null }) {
  const [exists, setExists] = useState<boolean | null>(null)

  useEffect(() => {
    // Log mount
    console.log("SalesforceIndicator mounted for:", email)

    if (!email || email === "No email on file") {
      console.log("SalesforceIndicator: No valid email, skipping")
      setExists(false)
      return
    }
    const check = async () => {
      try {
        console.log(`Checking Salesforce for ${email}...`)
        const res = await fetch(`/api/admin/salesforce/check?email=${encodeURIComponent(email)}`)
        if (res.ok) {
          const json = await res.json()
          console.log(`Salesforce result for ${email}:`, json)
          setExists(json.exists)
        } else {
          console.error(`Salesforce API error for ${email}:`, res.status, res.statusText)
          setExists(false)
        }
      } catch (e) {
        console.error("Failed to check Salesforce status", e)
        setExists(false)
      }
    }
    check()
  }, [email])

  if (!exists) return null

  return (
    <div title="Connected to Salesforce Contact">
      <svg className="h-5 w-5 text-[#00A1E0]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 12.3c0-.9-.3-1.7-.8-2.3.5-1.1.8-2.4.8-3.6 0-3.5-2.9-6.4-6.4-6.4-2.4 0-4.6 1.4-5.7 3.4C6.2 3.2 5.6 3 5 3 2.2 3 0 5.2 0 8c0 1.2.4 2.3 1.1 3.2C.4 11.8 0 12.6 0 13.5c0 2.5 2 4.5 4.5 4.5h14c3 0 5.5-2.5 5.5-5.5 0-2.8-2.1-5.1-4.9-5.4-.1.1-.1.2-.2.2z" />
      </svg>
    </div>
  )
}

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

function getDisplayUser(profile?: ProfileRow, data?: WizardData | null) {
  const step0 = data?.step0
  const nameParts = [profile?.first_name ?? step0?.firstName ?? "", profile?.last_name ?? step0?.lastName ?? ""].filter(
    Boolean
  )
  const name = nameParts.join(" ") || profile?.email || step0?.email || "Unknown user"
  const email = profile?.email ?? step0?.email ?? "No email on file"
  return { name, email }
}

function progressBorder(pct: number) {
  if (pct >= 80) return "border-l-green-500"
  if (pct >= 40) return "border-l-amber-500"
  return "border-l-slate-300"
}

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Updated (newest)" },
  { value: "updated_asc", label: "Updated (oldest)" },
  { value: "created_desc", label: "Created (newest)" },
  { value: "created_asc", label: "Created (oldest)" },
  { value: "name_asc", label: "Name (A→Z)" },
  { value: "name_desc", label: "Name (Z→A)" },
  { value: "progress_desc", label: "Progress (high→low)" },
  { value: "progress_asc", label: "Progress (low→high)" },
]

export function AdminListClient({ rows }: { rows: AdminRow[] }) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("updated_desc")
  const [items, setItems] = useState(rows.filter((r) => !r.app.archived))
  const [confirming, setConfirming] = useState<{
    id: string
    action: "archive" | "restore"
    name: string
  } | null>(null)

  useEffect(() => {
    setItems(rows.filter((r) => !r.app.archived))
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return items.filter(({ app, profile }) => {
      if (!q) return true
      const nameParts = [
        profile?.first_name ?? "",
        profile?.last_name ?? "",
        app.data?.step0?.firstName ?? "",
        app.data?.step0?.lastName ?? "",
        profile?.email ?? app.data?.step0?.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
      return nameParts.includes(q)
    })
  }, [items, query])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const nameA =
        (a.profile?.first_name ?? a.app.data?.step0?.firstName ?? "") +
        " " +
        (a.profile?.last_name ?? a.app.data?.step0?.lastName ?? "")
      const nameB =
        (b.profile?.first_name ?? b.app.data?.step0?.firstName ?? "") +
        " " +
        (b.profile?.last_name ?? b.app.data?.step0?.lastName ?? "")
      if (sort === "name_asc") return nameA.localeCompare(nameB)
      if (sort === "name_desc") return nameB.localeCompare(nameA)
      if (sort === "progress_asc") return a.progress - b.progress
      if (sort === "progress_desc") return b.progress - a.progress
      if (sort === "created_asc")
        return (new Date(a.app.created_at || 0).getTime() || 0) - (new Date(b.app.created_at || 0).getTime() || 0)
      if (sort === "created_desc")
        return (new Date(b.app.created_at || 0).getTime() || 0) - (new Date(a.app.created_at || 0).getTime() || 0)
      // default updated_desc
      return (new Date(b.app.updated_at || 0).getTime() || 0) - (new Date(a.app.updated_at || 0).getTime() || 0)
    })
    return copy
  }, [filtered, sort])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
          <div className="text-xs text-slate-500">Live filtering</div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <label className="text-slate-600" htmlFor="sort">
            Sort:
          </label>
          <select
            id="sort"
            name="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sorted.map(({ app, profile, progress, attachments }) => {
        const user = getDisplayUser(profile, app.data ?? null)
        const d: Partial<WizardData> = (app.data ?? {}) as Partial<WizardData>
        const emailForReminder = profile?.email ?? d.step0?.email ?? null
        const insuranceRequested =
          Boolean(d.step3?.insuranceContactRequested) || Boolean(d.step3?.contactInsurancePartner)
        const isArchived = Boolean(app.archived)

        const archiveLabel = isArchived ? "Restore" : "Archive"
        const archiveColor = isArchived
          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
          : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"

        return (
          <details
            key={app.id}
            className={`rounded-xl border bg-white/90 backdrop-blur-sm group shadow-sm hover:shadow-md border-slate-200 ${progressBorder(
              progress
            )} border-l-4`}
          >
            <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 transition-transform duration-200 group-open:rotate-90">▶</span>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-slate-900">{user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{user.email}</span>
                    <SalesforceIndicator email={user.email} />
                  </div>
                  <span className="text-xs text-slate-500">
                    Updated: {app.updated_at ? new Date(app.updated_at).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {insuranceRequested && (
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200">
                    IIS Contact Requested
                  </span>
                )}
                {isArchived && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                    Archived
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setConfirming({
                        id: app.id,
                        action: isArchived ? "restore" : "archive",
                        name: user.name,
                      })
                    }}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition ${archiveColor}`}
                  >
                    {archiveLabel}
                  </button>
                </div>
                <div className="hidden md:flex h-2 w-28 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${progress >= 80 ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-orange-600"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</div>
                  <div className="text-xl font-bold text-slate-900">{progress}%</div>
                </div>
              </div>
            </summary>
            <div className="border-t p-4 space-y-3">
              <div className="text-sm text-slate-700">
                <span className="font-medium">Primary Trade:</span> {app.primary_trade || "—"} |{" "}
                <span className="font-medium">License Type:</span> {app.license_type || "—"}
              </div>

              <div className="space-y-2">
                <AdminSectionBlock label="License Setup & Basic Info" sectionKey="step0" applicationId={app.id} data={d.step0 as Record<string, unknown>}>
                  {renderSection("License Setup & Basic Info", (d.step0 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock label="Pre-Licensure / Education" sectionKey="step1" applicationId={app.id} data={d.step1 as Record<string, unknown>}>
                  {renderSection("Pre-Licensure / Education", (d.step1 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Business Entity, FEIN & Banking"
                  sectionKey="step2"
                  applicationId={app.id}
                  data={d.step2 as Record<string, unknown>}
                >
                  {renderSection("Business Entity, FEIN & Banking", (d.step2 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock label="Insurance" sectionKey="step3" applicationId={app.id} data={d.step3 as Record<string, unknown>}>
                  {renderSection("Insurance", (d.step3 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock
                  label="Experience & Qualifier"
                  sectionKey="step4"
                  applicationId={app.id}
                  data={d.step4 as Record<string, unknown>}
                >
                  {renderSection("Experience & Qualifier", (d.step4 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock label="Exams (Business & Law)" sectionKey="step5" applicationId={app.id} data={d.step5 as Record<string, unknown>}>
                  {renderSection("Exams (Business & Law)", (d.step5 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock label="DOPL Application" sectionKey="step6" applicationId={app.id} data={d.step6 as Record<string, unknown>}>
                  {renderSection("DOPL Application", (d.step6 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
                <AdminSectionBlock label="Review / Attestation" sectionKey="step7" applicationId={app.id} data={d.step7 as Record<string, unknown>}>
                  {renderSection("Review / Attestation", (d.step7 as Record<string, unknown>) || {})}
                </AdminSectionBlock>
              </div>

              <ReminderActions applicationId={app.id} data={d} email={emailForReminder} />

              <AttachmentList attachments={attachments} />
            </div>
          </details>
        )
      })}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">
                {confirming.action === "archive" ? "Archive application?" : "Restore application?"}
              </div>
              <div className="text-sm text-slate-600">
                {confirming.name}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirming) return
                  const nextArchived = confirming.action === "archive"
                  const res = await fetch("/api/admin/application/archive", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ applicationId: confirming.id, archived: nextArchived }),
                  })
                  if (!res.ok) {
                    alert("Failed to update archive state")
                    return
                  }
                  setItems((prev) =>
                    nextArchived
                      ? prev.filter((row) => row.app.id !== confirming.id)
                      : prev.map((row) =>
                          row.app.id === confirming.id ? { ...row, app: { ...row.app, archived: nextArchived } } : row
                        )
                  )
                  setConfirming(null)
                }}
                className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${
                  confirming.action === "archive" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

