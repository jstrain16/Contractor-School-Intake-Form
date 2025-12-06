"use client"

import { useState } from "react"

type App = {
  app: {
    id: string
    data: any
    updated_at: string | null
    created_at: string | null
  }
  profile?: {
    user_id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
  }
}

function displayName(app: App) {
  const step0 = app.app.data?.step0 ?? {}
  const nameParts = [app.profile?.first_name ?? step0.firstName ?? "", app.profile?.last_name ?? step0.lastName ?? ""].filter(Boolean)
  const name = nameParts.join(" ") || app.profile?.email || step0.email || "Unknown user"
  const email = app.profile?.email ?? step0.email ?? "No email on file"
  return { name, email }
}

export default function ArchivedApplications({ items }: { items: App[] }) {
  const [list, setList] = useState(items)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"delete" | "restore" | null>(null)

  async function unarchiveApp(id: string) {
    const res = await fetch("/api/admin/application/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: id, archived: false }),
    })
    if (!res.ok) {
      alert("Failed to restore application")
      return
    }
    setList((prev) => prev.filter((a) => a.app.id !== id))
  }

  async function deleteApp(id: string) {
    const res = await fetch("/api/admin/application/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: id }),
    })
    if (!res.ok) {
      alert("Failed to delete application")
      return
    }
    setList((prev) => prev.filter((a) => a.app.id !== id))
  }

  if (list.length === 0) {
    return <div className="text-sm text-slate-600">No archived applications.</div>
  }

  return (
    <div className="space-y-3">
      {list.map((row) => {
        const user = displayName(row)
        return (
          <div key={row.app.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{user.name}</span>
              <span className="text-xs text-slate-600">{user.email}</span>
              <span className="text-[11px] text-slate-500">
                Updated: {row.app.updated_at ? new Date(row.app.updated_at).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirmId === row.app.id && confirmAction === "restore") {
                    unarchiveApp(row.app.id)
                    setConfirmId(null)
                    setConfirmAction(null)
                  } else {
                    setConfirmId(row.app.id)
                    setConfirmAction("restore")
                  }
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 ${
                  confirmId === row.app.id && confirmAction === "restore" ? "ring-2 ring-amber-300" : ""
                }`}
              >
                {confirmId === row.app.id && confirmAction === "restore" ? "Confirm" : "Unarchive"}
              </button>
              {confirmId === row.app.id && confirmAction === "restore" && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmId(null)
                    setConfirmAction(null)
                  }}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirmId === row.app.id && confirmAction === "delete") {
                    deleteApp(row.app.id)
                    setConfirmId(null)
                    setConfirmAction(null)
                  } else {
                    setConfirmId(row.app.id)
                    setConfirmAction("delete")
                  }
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white ${
                  confirmId === row.app.id && confirmAction === "delete" ? "bg-red-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmId === row.app.id && confirmAction === "delete" ? "Confirm" : "Delete"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}


