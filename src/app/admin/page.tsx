"use server"

import { redirect } from "next/navigation"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { WizardData } from "@/lib/schemas"
import { buildStatus } from "@/lib/progress"
import Link from "next/link"
import { AdminListClient } from "@/components/admin/AdminListClient"

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

        <AdminListClient rows={rows} />
      </div>
    </div>
  )
}

