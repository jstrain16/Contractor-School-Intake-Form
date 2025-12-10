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

  const formatDate = (d?: string | null) => {
    if (!d) return "—"
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return "—"
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const normalizeRole = (val?: string | null) => {
    const raw = (val || "").toLowerCase().trim().replace(/[\s-]+/g, "_")
    if (raw === "super_admin" || raw === "superadmin") return "super_admin"
    if (raw === "admin") return "admin"
    if (raw === "applicant" || raw === "user") return "applicant"
    return "applicant"
  }

  const roleLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin"
    if (role === "admin") return "Admin"
    return "Applicant"
  }

  const userRows = (profileRows || []).map((u) => {
    const email = u.email?.toLowerCase() || ""
    const resolvedRole = normalizeRole(u.role)
    const resolvedRoleLabel = roleLabel(resolvedRole)

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
      role: resolvedRole,
      roleLabel: resolvedRoleLabel,
      status,
      lastActiveDisplay,
      createdDisplay,
    }
  })

  const stats = {
    superAdmins: userRows.filter((u) => u.role === "super_admin").length,
    admins: userRows.filter((u) => u.role === "admin").length,
    applicants: userRows.filter((u) => u.role === "applicant").length,
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
    role: normalizeRole(u.role),
    status: u.status || "Active",
    lastActiveDisplay: u.lastActiveDisplay,
    createdDisplay: u.createdDisplay,
    active: (u as any).active !== false,
  }))

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
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

