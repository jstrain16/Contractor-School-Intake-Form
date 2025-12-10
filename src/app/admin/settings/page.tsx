"use server"

import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminInviteForm } from "@/components/admin/AdminInviteForm"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import ArchivedApplications from "@/components/admin/ArchivedApplications"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  const userRows = profileRows.length > 0 ? profileRows : []
  const stats = {
    superAdmins: 1,
    admins: Math.max(userRows.length - 2, 0),
    applicants: appRows.length,
    activeUsers: userRows.length,
  }

  const searchParamsObj = new URLSearchParams()

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
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
            <div className="text-lg font-semibold text-slate-900">All Users</div>
            <div className="flex flex-1 items-center gap-3 md:flex-none">
              <input
                type="text"
                name="q"
                placeholder="Search users..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none md:w-80"
              />
              <Button className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
                + Add User
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-800">
                {userRows.map((u) => {
                  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email || "Unknown user"
                  const role = u.email?.includes("@contractorsschool.com") ? "Admin" : "Applicant"
                  const status = "Active"
                  const lastActive = "—"
                  const createdDate = "—"
                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{name}</div>
                          <div className="text-xs text-slate-600">{u.email || "No email"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            role === "Admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lastActive}</td>
                      <td className="px-4 py-3 text-slate-600">{createdDate}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" className="text-slate-700 hover:bg-slate-100">
                          ⋮
                        </Button>
                      </td>
                    </tr>
                  )
                })}
                {userRows.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Invite an admin</h2>
          <p className="text-sm text-slate-600">Add an email to allow admin access.</p>
          <div className="mt-3">
            <AdminInviteForm />
          </div>
        </Card>

        <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-slate-900">
            <span>Archived applications</span>
            <span className="text-sm font-normal text-slate-600">(click to expand)</span>
          </summary>
          <p className="mt-2 text-sm text-slate-600">Restore or delete archived applications.</p>
          <div className="mt-3">
            <ArchivedApplications items={archived} />
          </div>
        </details>
      </div>
    </div>
  )
}

