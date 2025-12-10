"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AdminSyncUsersButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const syncUsers = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/admin/users/sync", { method: "POST" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to sync users")
      }
      setMessage(`Synced ${json?.count ?? 0} users from Clerk`)
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to sync users"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={syncUsers}
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
        >
          {loading ? "Syncing..." : "Sync users from Clerk"}
        </Button>
        {message && <span className="text-sm text-green-700">{message}</span>}
        {error && <span className="text-sm text-rose-700">{error}</span>}
      </div>
    </div>
  )
}

