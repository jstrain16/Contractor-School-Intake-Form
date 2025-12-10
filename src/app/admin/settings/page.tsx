"use server"

import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminInviteForm } from "@/components/admin/AdminInviteForm"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminUsersTable, type AdminUserRow } from "@/components/admin/AdminUsersTable"

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
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

  // Fetch admin allowlist to derive roles
  const { data: adminUsers } = await supabase.from("admin_users").select("email, role")

  // Fetch all user profiles (store all users here)
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id,user_id,clerk_id,email,first_name,last_name,phone,created_at,updated_at,role,last_active_at")

  const profileRows = profiles || []

  const profileMap = new Map<string, (typeof profileRows)[number]>()
  profileRows.forEach((p) => profileMap.set(p.user_id, p))

  const archived = appRows.map((app) => ({
    app,
    profile: profileMap.get(app.user_id),
  }))

  const now = Date.now()
  const adminEmailMap = new Map<string, string>( // email -> role
    (adminUsers || []).map((a) => [a.email?.toLowerCase() ?? "", (a.role || "admin").toLowerCase()])
  )

  const formatDate = (d?: string | null) => {
    if (!d) return "—"
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return "—"
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const userRows = (profileRows || []).map((u) => {
    const email = u.email?.toLowerCase() || ""
    const profileRole = (u.role || "").toLowerCase()
    const adminRole = email ? adminEmailMap.get(email) : undefined
    const resolvedRole =
      profileRole === "super_admin" || profileRole === "admin" || profileRole === "applicant"
        ? profileRole
        : adminRole
    const role =
      resolvedRole === "super_admin" ? "Super Admin" : resolvedRole === "admin" ? "Admin" : "Applicant"

    // compute last active from profile.updated_at or app updated_at
    const relatedApps = appRows.filter((a) => a.user_id === u.user_id)
    const latestAppTs = relatedApps
      .map((a) => (a.updated_at ? new Date(a.updated_at).getTime() : 0))
      .reduce((m, v) => Math.max(m, v), 0)
    const profileUpdatedTs = u.updated_at ? new Date(u.updated_at as string).getTime() : 0
    const profileLastActiveTs = (u as any).last_active_at ? new Date((u as any).last_active_at).getTime() : 0
    const lastActiveTs = Math.max(latestAppTs, profileUpdatedTs, profileLastActiveTs)
    const lastActiveDisplay = lastActiveTs ? formatDate(new Date(lastActiveTs).toISOString()) : "—"

    const createdTs = u.created_at ? new Date(u.created_at as string).getTime() : 0
    const createdDisplay = createdTs ? formatDate(new Date(createdTs).toISOString()) : "—"

    const inactiveThreshold = 1000 * 60 * 60 * 24 * 30 // 30 days
    const status = lastActiveTs && now - lastActiveTs > inactiveThreshold ? "Inactive" : "Active"

    return {
      ...u,
      role,
      status,
      lastActiveDisplay,
      createdDisplay,
    }
  })

  const stats = {
    superAdmins: userRows.filter((u) => u.role === "Super Admin").length,
    admins: userRows.filter((u) => u.role === "Admin").length,
    applicants: userRows.filter((u) => u.role === "Applicant").length,
    activeUsers: userRows.filter((u) => u.status === "Active").length,
  }

  const q = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase().trim() : ""
  const filteredUsers = userRows.filter((u) => {
    if (!q) return true
    const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase()
    return name.includes(q) || (u.email || "").toLowerCase().includes(q)
  })

  const clientRows: AdminUserRow[] = filteredUsers.map((u) => ({
    id: u.id,
    user_id: u.user_id,
    clerk_id: u.clerk_id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    phone: u.phone,
    role: (u.role || "applicant").toLowerCase(),
    status: u.status || "Active",
    lastActiveDisplay: u.lastActiveDisplay,
    createdDisplay: u.createdDisplay,
    active: (u as any).active !== false,
  }))

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="flex items-center justify-between border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              ←
            </Link>
            <div>
              <div className="text-lg font-semibold text-slate-900">Settings</div>
              <div className="text-sm text-slate-500">System Configuration</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-lg border-slate-200 text-slate-900">
              Save Changes
            </Button>
            <Button className="rounded-lg bg-orange-500 text-white hover:bg-orange-600">Publish</Button>
          </div>
        </Card>

        <Card className="border-slate-200 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button className="rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200" variant="ghost">
              User Management
            </Button>
            <Button variant="ghost" className="rounded-lg text-slate-700 hover:bg-slate-100">
              Roles & Permissions
            </Button>
            <Button variant="ghost" className="rounded-lg text-slate-700 hover:bg-slate-100">
              System Settings
            </Button>
            <Button variant="ghost" className="rounded-lg text-slate-700 hover:bg-slate-100">
              Notifications
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 px-5 py-4">
            <div className="text-4xl font-bold text-slate-900">{stats.superAdmins}</div>
            <div className="text-sm text-slate-600">Super Admins</div>
          </Card>
          <Card className="border-slate-200 px-5 py-4">
            <div className="text-4xl font-bold text-slate-900">{stats.admins}</div>
            <div className="text-sm text-slate-600">Admins</div>
          </Card>
          <Card className="border-slate-200 px-5 py-4">
            <div className="text-4xl font-bold text-slate-900">{stats.applicants}</div>
            <div className="text-sm text-slate-600">Applicants</div>
          </Card>
          <Card className="border-slate-200 px-5 py-4">
            <div className="text-4xl font-bold text-slate-900">{stats.activeUsers}</div>
            <div className="text-sm text-slate-600">Active Users</div>
          </Card>
        </div>

        <Card className="border-slate-200 px-4 py-4">
          <AdminUsersTable rows={clientRows} />
        </Card>

      </div>
    </div>
  )
}

