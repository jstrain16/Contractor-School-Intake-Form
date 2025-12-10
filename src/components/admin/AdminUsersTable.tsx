"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminSyncUsersButton } from "@/components/admin/AdminSyncUsersButton"
import { AdminInviteForm } from "@/components/admin/AdminInviteForm"

export type AdminUserRow = {
  id: string
  user_id: string
  clerk_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone?: string | null
  role: string
  status: string
  lastActiveDisplay: string
  createdDisplay: string
  active: boolean
}

type Props = {
  rows: AdminUserRow[]
}

const ROLE_OPTIONS: Array<{ value: "super_admin" | "admin" | "applicant"; label: string; desc: string }> = [
  { value: "super_admin", label: "Super Admin", desc: "Full system access" },
  { value: "admin", label: "Admin", desc: "Manage applicants and emails" },
  { value: "applicant", label: "Applicant", desc: "Portal access only" },
]

export function AdminUsersTable({ rows }: Props) {
  const [filtered, setFiltered] = useState(rows)
  const [q, setQ] = useState("")
  const [modalUser, setModalUser] = useState<AdminUserRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [role, setRole] = useState<"super_admin" | "admin" | "applicant">("applicant")
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const doFilter = (val: string) => {
    setQ(val)
    const needle = val.toLowerCase()
    setFiltered(
      rows.filter((r) => {
        if (!needle) return true
        const name = `${r.first_name ?? ""} ${r.last_name ?? ""}`.toLowerCase()
        const email = (r.email || "").toLowerCase()
        return name.includes(needle) || email.includes(needle)
      })
    )
  }

  const openModal = (u: AdminUserRow) => {
    setModalUser(u)
    setRole((u.role || "applicant").toLowerCase() as any)
    setActive(u.active)
    setError(null)
  }

  const saveChanges = async () => {
    if (!modalUser) return
    setSaving(true)
    setError(null)
    try {
      const roleRes = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: modalUser.user_id, email: modalUser.email, role }),
      })
      const roleJson = await roleRes.json()
      if (!roleRes.ok) throw new Error(roleJson?.error || "Failed to update role")

      const statusRes = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: modalUser.user_id, active }),
      })
      const statusJson = await statusRes.json()
      if (!statusRes.ok) throw new Error(statusJson?.error || "Failed to update status")

      setModalUser((prev) => (prev ? { ...prev, role, active } : prev))
      setFiltered((prev) =>
        prev.map((u) => (u.user_id === modalUser.user_id ? { ...u, role, active } : u))
      )
    } catch (e: any) {
      setError(e?.message || "Failed to save changes")
      return
    } finally {
      setSaving(false)
    }
    setModalUser(null)
  }

  const deleteUser = async () => {
    if (!modalUser) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: modalUser.user_id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to delete")
      setFiltered((prev) => prev.filter((u) => u.user_id !== modalUser.user_id))
      setModalUser(null)
    } catch (e: any) {
      setError(e?.message || "Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  const statusPill = (role: string) => {
    if (role === "super_admin") return "bg-purple-100 text-purple-700"
    if (role === "admin") return "bg-blue-100 text-blue-700"
    return "bg-slate-100 text-slate-700"
  }

  const statusLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin"
    if (role === "admin") return "Admin"
    return "Applicant"
  }

  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold text-slate-900">All Users</div>
        <div className="flex flex-1 flex-wrap items-center gap-3 md:flex-none">
          <input
            type="text"
            value={q}
            onChange={(e) => doFilter(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none md:w-80"
          />
          <AdminSyncUsersButton />
          <Button
            type="button"
            className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
            onClick={() => setShowInvite(true)}
          >
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
            {filtered.map((u) => {
              const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email || "Unknown user"
              const roleStyle = statusPill(u.role.toLowerCase())
              const statusStyle =
                u.active === false ? "bg-slate-100 text-slate-700" : "bg-green-100 text-green-700"
              return (
                <tr key={u.user_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className="text-xs text-slate-600">{u.email || "No email"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${roleStyle}`}>
                      {statusLabel(u.role.toLowerCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
                      {u.active === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.lastActiveDisplay || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.createdDisplay || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="text-slate-700 hover:bg-slate-100" onClick={() => openModal(u)}>
                      ⋮
                    </Button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-xl font-semibold text-slate-900">
                  {(modalUser.first_name || modalUser.last_name) ? `${modalUser.first_name ?? ""} ${modalUser.last_name ?? ""}`.trim() : modalUser.email || "User"}
                </div>
                <div className="text-sm text-slate-500">{modalUser.user_id}</div>
              </div>
              <Button variant="ghost" onClick={() => setModalUser(null)} className="text-slate-600">
                ✕
              </Button>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-base text-slate-900">{modalUser.email || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Created Date</div>
                  <div className="text-base text-slate-900">{modalUser.createdDisplay || "—"}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-sm text-slate-500 mb-2">User Role</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {ROLE_OPTIONS.map((opt) => {
                    const selected = role === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                          selected ? "border-purple-500 bg-purple-50 text-slate-900" : "border-slate-200 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                        <div className="text-xs font-normal text-slate-500">{opt.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <div>
                  <div className="text-sm text-slate-500">Account Status</div>
                  <div className="text-xs text-slate-500">
                    {active ? "User has full access" : "User is deactivated"}
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 transition-all peer-checked:bg-green-500">
                    <div className="h-5 w-5 translate-x-1 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>

              {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={saveChanges}
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={deleteUser}
                  disabled={deleting}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  {deleting ? "Deleting..." : "Delete User"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="text-lg font-semibold text-slate-900">Add User</div>
              <Button variant="ghost" onClick={() => setShowInvite(false)} className="text-slate-600">
                ✕
              </Button>
            </div>
            <div className="px-6 py-4">
              <AdminInviteForm
                onInvited={() => {
                  setShowInvite(false)
                }}
                onError={setError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

