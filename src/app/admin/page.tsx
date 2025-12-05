"use server"

import { redirect } from "next/navigation"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { WizardData } from "@/lib/schemas"

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

const WEIGHTS = {
  licenseSetup: 5,
  preLicensure: 15,
  business: 25,
  gl: 9,
  wc: 11,
  experience: 10,
  exams: 10,
  dopl: 2,
}

function computeProgress(data: Partial<WizardData> | null): number {
  const d = data || {}
  const isGeneral = d.step0?.licenseType === "general"
  const items = [
    { done: !!d.step0?.firstName && !!d.step0?.licenseType && !!d.step0?.email, weight: WEIGHTS.licenseSetup },
    { done: !!d.step1?.preLicensureCompleted || (d.step1?.exemptions?.length ?? 0) > 0, weight: WEIGHTS.preLicensure },
    { done: !!d.step2?.legalBusinessName && !!d.step2?.federalEin, weight: WEIGHTS.business },
    { done: d.step3?.hasGlInsurance === true, weight: WEIGHTS.gl },
    { done: d.step0?.hasEmployees ? d.step3?.hasWorkersComp === true : d.step3?.hasWcWaiver === true, weight: WEIGHTS.wc },
    { done: isGeneral ? !!d.step4?.hasExperience : true, weight: WEIGHTS.experience },
    { done: isGeneral ? d.step5?.examStatus === "passed" : true, weight: WEIGHTS.exams },
    { done: d.step6?.doplAppCompleted === true, weight: WEIGHTS.dopl },
  ]
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  const completed = items.filter((i) => i.done).reduce((sum, i) => sum + i.weight, 0)
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

async function fetchAdminData() {
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
      progress: computeProgress(app.data ?? null),
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
      <div className="mt-2 space-y-2 text-sm">
        {entries.length === 0 && <div className="text-slate-600">No responses</div>}
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[180px,1fr] gap-2 items-start">
            <div className="text-slate-700 font-medium">{formatKey(k)}</div>
            <div className="text-slate-800">{formatValue(v)}</div>
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

export default async function AdminPage() {
  const { isAllowed } = await requireAdminEmail()
  if (!isAllowed) {
    redirect("/sign-in")
  }

  const rows = await fetchAdminData()

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
        </div>

        <div className="space-y-3">
          {rows.map(({ app, profile, progress, attachments }) => {
            const user = getDisplayUser(profile, app.data ?? null)
            const d = app.data ?? {}
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
                    {renderSection("License Setup & Basic Info", d.step0 as Record<string, unknown>)}
                    {renderSection("Pre-Licensure / Education", d.step1 as Record<string, unknown>)}
                    {renderSection("Business Entity, FEIN & Banking", d.step2 as Record<string, unknown>)}
                    {renderSection("Insurance", d.step3 as Record<string, unknown>)}
                    {renderSection("Experience & Qualifier", d.step4 as Record<string, unknown>)}
                    {renderSection("Exams (Business & Law)", d.step5 as Record<string, unknown>)}
                    {renderSection("DOPL Application", d.step6 as Record<string, unknown>)}
                    {renderSection("Review / Attestation", d.step7 as Record<string, unknown>)}
                  </div>

                  <details className="border rounded-md p-3 bg-slate-50">
                    <summary className="cursor-pointer text-sm font-medium text-slate-800">
                      Attachments ({attachments.length})
                    </summary>
                    <div className="mt-2 space-y-2 text-sm">
                      {attachments.length === 0 && <div className="text-slate-600">No attachments</div>}
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between">
                          {(() => {
                            const originalName =
                              typeof att.metadata?.originalName === "string" ? att.metadata.originalName : null
                            const fallbackName = att.path.split("/").pop() || att.path
                            const displayName = originalName ?? fallbackName
                            return (
                              <div>
                                <div className="font-medium text-slate-800">{displayName}</div>
                                <div className="text-xs text-slate-600">
                                  {att.file_type || "file"} •{" "}
                                  {att.created_at ? new Date(att.created_at).toLocaleString() : "—"}
                                </div>
                              </div>
                            )
                          })()}
                          {att.signedUrl ? (
                            <a
                              href={att.signedUrl}
                              className="text-blue-600 text-sm underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-xs text-red-600">No link</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </div>
  )
}

