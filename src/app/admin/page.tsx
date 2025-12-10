"use server"

import { redirect } from "next/navigation"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { WizardData } from "@/lib/schemas"
import { buildStatus } from "@/lib/progress"
import Link from "next/link"
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient"

type ApplicationRow = {
  id: string
  user_id: string
  data: WizardData | null
  updated_at: string | null
  created_at: string | null
  primary_trade: string | null
  license_type: string | null
  archived?: boolean | null
  assigned_admin_id?: string | null
  assigned_admin_email?: string | null
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
    .select("id,user_id,data,updated_at,created_at,primary_trade,license_type,archived,assigned_admin_id,assigned_admin_email")
    .order("updated_at", { ascending: false })

  if (appsError) throw appsError
  const appRows = (applications || []) as ApplicationRow[]

  const userIds = appRows.map((a) => a.user_id)
  let profileRows: ProfileRow[] = []
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id,email,first_name,last_name,phone")
    .in("user_id", userIds)

  if (profileError) {
    // If the user_profiles table does not exist in this environment, continue without profile data.
    if ((profileError as any)?.code === "PGRST205" || /user_profiles/i.test(profileError.message || "")) {
      console.warn("user_profiles table not found; continuing without profile data")
      profileRows = []
    } else {
      throw profileError
    }
  } else {
    profileRows = (profiles || []) as ProfileRow[]
  }

  const profileMap = new Map<string, ProfileRow>()
  profileRows.forEach((p) => profileMap.set(p.user_id, p as ProfileRow))

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

  const filteredApps = appRows.filter((a) => !a.archived)

  return filteredApps.map((app) => {
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminDashboardClient rows={rows} />
      </div>
    </div>
  )
}

