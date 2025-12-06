"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onInvited?: () => void
  onError?: (msg: string | null) => void
}

export function AdminInviteForm({ onInvited, onError }: Props) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    onError?.(null)
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to invite")
      }
      setEmail("")
      setMessage("Invite saved")
      onInvited?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to invite admin"
      setError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="sm:max-w-sm"
        />
        <Button onClick={submit} disabled={loading || !email.trim()}>
          {loading ? "Inviting..." : "Invite admin"}
        </Button>
      </div>
      <p className="text-xs text-slate-500">Admins are also checked against env allowlist.</p>
      {(message || error) && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}
    </div>
  )
}

