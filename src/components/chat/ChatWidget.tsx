"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ChatKit, useChatKit } from "@openai/chatkit-react"
import { MessageCircle } from "lucide-react"

function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "unknown-device"
  const key = "chatkit-device-id"
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  window.localStorage.setItem(key, id)
  return id
}

function useIsAdmin() {
  const { user } = useUser()
  return useMemo(() => {
    const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    const metaAdmin = user?.publicMetadata && (user.publicMetadata as Record<string, unknown>).isAdmin === true
    const emails = user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
    return metaAdmin || emails.some((em) => allowlist.includes(em as string))
  }, [user?.emailAddresses, user?.publicMetadata])
}

export function ChatWidget() {
  const pathname = usePathname()
  const isAdmin = useIsAdmin()
  const [open, setOpen] = useState(false)
  const [deviceId, setDeviceId] = useState("unknown-device")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        })
        if (!res.ok) {
          const text = await res.text().catch(() => "Failed to create ChatKit session")
          setError(text || "Failed to create ChatKit session")
          throw new Error(text)
        }
        const { client_secret } = await res.json()
        return client_secret
      },
    },
  })

  const isAdminRoute = pathname?.startsWith("/admin")
  if (isAdminRoute || isAdmin) return null

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 w-80 h-[520px] rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
          {error ? (
            <div className="p-4 text-sm text-red-600">Chat unavailable: {error}</div>
          ) : (
            <ChatKit control={control} className="h-full w-full" />
          )}
        </div>
      )}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg border border-slate-200 bg-white hover:shadow-xl transition"
      >
        <span className="sr-only">Chat</span>
        <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center">
          <MessageCircle className="h-6 w-6" />
        </div>
      </button>
    </>
  )
}

export default ChatWidget


