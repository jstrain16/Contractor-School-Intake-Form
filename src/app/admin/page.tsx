"use server"

import { redirect } from "next/navigation"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { WizardData } from "@/lib/schemas"
import { AdminSectionBlock } from "@/components/admin/AdminSectionBlock"
import { buildStatus } from "@/lib/progress"
import { ReminderActions } from "@/components/admin/ReminderActions"
import { AttachmentList } from "@/components/admin/AttachmentList"
import Link from "next/link"

type ApplicationRow = {
  id: string
  user_id: string
  data: WizardData | null
  updated_at: string | null
  created_at: string | null
  primary_trade: string | null
  license_type: string | null
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

type DisplayUser = { name: string; email: string }
type AdminAttachment = AttachmentRow & { signedUrl: string | null }
type AdminRow = { app: ApplicationRow; profile?: ProfileRow; progress: number; attachments: AdminAttachment[] }

async function fetchAdminData(): Promise<AdminRow[]> {
  const supabase = getSupabaseAdminClient()

  const { data: applications, error: appsError } = await supabase
    .from("contractor_applications")
    .select("id,user_id,data,updated_at,created_at,primary_trade,license_type")
    .order("updated_at", { ascending: false })

  if (appsError) throw appsError
  const appRows = (applications || []) as ApplicationRow[]

  const userIds = appRows.map((a) => a.user_id)
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id,email,first_name,last_name,phone")
    .in("user_id", userIds)

  if (profileError) throw profileError
  const profileMap = new Map<string, ProfileRow>()
  ;(profiles || []).forEach((p) => profileMap.set(p.user_id, p as ProfileRow))

  const appIds = appRows.map((a) => a.id)
  const { data: attachments, error: attError } = await supabase
    .from("contractor_attachments")
    .select("id,application_id,path,bucket,file_type,metadata,created_at")
    .in("application_id", appIds)

  if (attError) throw attError
  const attachmentRows = (attachments || []) as AttachmentRow[]

  // Signed URLs
  const signedUrls = await Promise.all(
    attachmentRows.map(async (att) => {
      const { data, error } = await supabase.storage.from(att.bucket).createSignedUrl(att.path, 60 * 60)
      return { id: att.id, signedUrl: error ? null : data?.signedUrl ?? null }
    })
  )
  const signedMap = new Map(signedUrls.map((u) => [u.id, u.signedUrl]))

  return appRows.map((app) => {
    const attachmentsForApp = attachmentRows.filter((a) => a.application_id === app.id).map((a) => ({
      ...a,
      signedUrl: signedMap.get(a.id) ?? null,
    }))
    const profile = profileMap.get(app.user_id)
    return {
      app,
      profile,
      progress: buildStatus(app.data ?? null).progress,
      attachments: attachmentsForApp,
    }
  })
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
    return value.map((v, i) => <span key={i}>{formatValue(v)}{i < value.length - 1 ? ", " : ""}</span>)
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
          <div
            key={k}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatKey(k)}</div>
            <div className="mt-1 text-slate-900">{formatValue(v)}</div>
          </div>
        ))}
      </div>
    </details>
  )
}

function getDisplayUser(profile?: ProfileRow, data?: WizardData | null): DisplayUser {
  const step0 = data?.step0
  const nameParts = [
    profile?.first_name ?? step0?.firstName ?? "",
    profile?.last_name ?? step0?.lastName ?? "",
  ].filter(Boolean)
  const name = nameParts.join(" ") || profile?.email || step0?.email || "Unknown user"
  const email = profile?.email ?? step0?.email ?? "No email on file"
  return { name, email }
}

function SearchSortBar({ currentQuery, currentSort }: { currentQuery?: string; currentSort?: string }) {
  const sort = currentSort || "updated_desc"
  return (
    <form className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="q"
          defaultValue={currentQuery}
          placeholder="Search by name or email"
          className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
        >
          Search
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <label className="text-slate-600" htmlFor="sort">
          Sort:
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="updated_desc">Updated (newest)</option>
          <option value="updated_asc">Updated (oldest)</option>
          <option value="created_desc">Created (newest)</option>
          <option value="created_asc">Created (oldest)</option>
          <option value="name_asc">Name (A→Z)</option>
          <option value="name_desc">Name (Z→A)</option>
          <option value="progress_desc">Progress (high→low)</option>
          <option value="progress_asc">Progress (low→high)</option>
        </select>
      </div>
    </form>
  )
}

export default async function AdminPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const { isAllowed } = await requireAdminEmail()
  if (!isAllowed) {
    redirect("/sign-in")
  }

  const rows = await fetchAdminData()
  const qRaw = typeof searchParams?.q === "string" ? searchParams?.q : ""
  const sortRaw = typeof searchParams?.sort === "string" ? searchParams?.sort : ""
  const q = qRaw.toLowerCase().trim()

  const filtered = rows.filter(({ app, profile }) => {
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

  const sorted = [...filtered].sort((a, b) => {
    const sort = sortRaw || "updated_desc"
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

  const progressBorder = (pct: number) => {
    if (pct >= 80) return "border-l-green-500"
    if (pct >= 40) return "border-l-amber-500"
    return "border-l-slate-300"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
            <p className="text-slate-600 text-sm">Review applicant progress, answers, and attachments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Admin Settings
            </Link>
          </div>
        </div>

        <SearchSortBar currentQuery={qRaw} currentSort={sortRaw} />

        <div className="space-y-3">
          {sorted.map(({ app, profile, progress, attachments }) => {
            const user = getDisplayUser(profile, app.data ?? null)
            const d: Partial<WizardData> = (app.data ?? {}) as Partial<WizardData>
            const emailForReminder = profile?.email ?? d.step0?.email ?? null
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
                      <span className="text-sm text-slate-600">{user.email}</span>
                      <span className="text-xs text-slate-500">
                        Updated: {app.updated_at ? new Date(app.updated_at).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <AdminSectionBlock
                      label="License Setup & Basic Info"
                      sectionKey="step0"
                      applicationId={app.id}
                      data={d.step0 as Record<string, unknown>}
                    >
                      {renderSection("License Setup & Basic Info", d.step0 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Pre-Licensure / Education"
                      sectionKey="step1"
                      applicationId={app.id}
                      data={d.step1 as Record<string, unknown>}
                    >
                      {renderSection("Pre-Licensure / Education", d.step1 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Business Entity, FEIN & Banking"
                      sectionKey="step2"
                      applicationId={app.id}
                      data={d.step2 as Record<string, unknown>}
                    >
                      {renderSection("Business Entity, FEIN & Banking", d.step2 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Insurance"
                      sectionKey="step3"
                      applicationId={app.id}
                      data={d.step3 as Record<string, unknown>}
                    >
                      {renderSection("Insurance", d.step3 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Experience & Qualifier"
                      sectionKey="step4"
                      applicationId={app.id}
                      data={d.step4 as Record<string, unknown>}
                    >
                      {renderSection("Experience & Qualifier", d.step4 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Exams (Business & Law)"
                      sectionKey="step5"
                      applicationId={app.id}
                      data={d.step5 as Record<string, unknown>}
                    >
                      {renderSection("Exams (Business & Law)", d.step5 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="DOPL Application"
                      sectionKey="step6"
                      applicationId={app.id}
                      data={d.step6 as Record<string, unknown>}
                    >
                      {renderSection("DOPL Application", d.step6 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                    <AdminSectionBlock
                      label="Review / Attestation"
                      sectionKey="step7"
                      applicationId={app.id}
                      data={d.step7 as Record<string, unknown>}
                    >
                      {renderSection("Review / Attestation", d.step7 as Record<string, unknown> || {})}
                    </AdminSectionBlock>
                  </div>

                  <ReminderActions applicationId={app.id} data={d} email={emailForReminder} />

                  <AttachmentList attachments={attachments} />
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </div>
  )
}

