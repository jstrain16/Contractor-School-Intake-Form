"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  userId: string
  email?: string | null
  currentRole: string
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "applicant", label: "Applicant" },
]

export function AdminUserActions({ userId, email, currentRole }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateRole = async (role: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, role }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to update role")
      }
      setOpen(false)
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update role"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <Button variant="ghost" className="text-slate-700 hover:bg-slate-100" onClick={() => setOpen((o) => !o)}>
        ⋮
      </Button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="py-1 text-sm text-slate-800">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`block w-full px-3 py-2 text-left hover:bg-slate-50 ${
                  currentRole.toLowerCase() === opt.value ? "font-semibold text-orange-600" : ""
                }`}
                onClick={() => updateRole(opt.value)}
                disabled={loading}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {error && <div className="border-t border-rose-100 px-3 py-2 text-xs text-rose-700">{error}</div>}
        </div>
      )}
    </div>
  )
}

