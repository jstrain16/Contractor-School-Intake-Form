"use server"

import { redirect } from "next/navigation"
import { AdminInviteForm } from "@/components/admin/AdminInviteForm"
import { requireAdminEmail } from "@/lib/admin-auth"

export default async function AdminSettingsPage() {
  const { isAllowed } = await requireAdminEmail()
  if (!isAllowed) {
    redirect("/sign-in")
  }

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
      </div>
    </div>
  )
}

