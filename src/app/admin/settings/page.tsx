"use server"

import { redirect } from "next/navigation"
import { AdminInviteForm } from "@/components/admin/AdminInviteForm"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import ArchivedApplications from "@/components/admin/ArchivedApplications"

export default async function AdminSettingsPage() {
  const { isAllowed } = await requireAdminEmail()
  if (!isAllowed) {
    redirect("/sign-in")
  }

  const supabase = getSupabaseAdminClient()
  const { data: applications } = await supabase
    .from("contractor_applications")
    .select("id,user_id,data,updated_at,created_at,primary_trade,license_type,archived")
    .eq("archived", true)
    .order("updated_at", { ascending: false })

  const appRows = applications || []

  const userIds = appRows.map((a) => a.user_id)
  let profileRows: { user_id: string; email: string | null; first_name: string | null; last_name: string | null; phone: string | null }[] = []
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id,email,first_name,last_name,phone")
      .in("user_id", userIds)
    profileRows = profiles || []
  }

  const profileMap = new Map<string, (typeof profileRows)[number]>()
  profileRows.forEach((p) => profileMap.set(p.user_id, p))

  const archived = appRows.map((app) => ({
    app,
    profile: profileMap.get(app.user_id),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
            <p className="text-slate-600 text-sm">Invite admins and manage access.</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Invite an admin</h2>
          <p className="text-sm text-slate-600">Add an email to allow admin access.</p>
          <div className="mt-3">
            <AdminInviteForm />
          </div>
        </div>

        <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900 flex items-center justify-between">
            <span>Archived applications</span>
            <span className="text-sm font-normal text-slate-600">(click to expand)</span>
          </summary>
          <p className="text-sm text-slate-600 mt-2">Restore or delete archived applications.</p>
          <div className="mt-3">
            <ArchivedApplications items={archived} />
          </div>
        </details>
      </div>
    </div>
  )
}

