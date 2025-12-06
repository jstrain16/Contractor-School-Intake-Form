"use client"

import { useEffect, useMemo, useState } from "react"
import { ChatKit, useChatKit } from "@openai/chatkit-react"

function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "unknown-device"
  const key = "chatkit-device-id"
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  window.localStorage.setItem(key, id)
  return id
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [deviceId, setDeviceId] = useState("unknown-device")

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // Session refresh not implemented in this MVP
          return existing
        }
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        })
        if (!res.ok) {
          throw new Error("Failed to create ChatKit session")
        }
        const { client_secret } = await res.json()
        return client_secret
      },
    },
  })

  const logoUrl = useMemo(
    () => "https://beacontractor.com/wp-content/uploads/2021/08/logo.svg",
    []
  )

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 w-80 h-[520px] rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
          <ChatKit control={control} className="h-full w-full" />
        </div>
      )}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg border border-slate-200 bg-white hover:shadow-xl transition"
      >
        <span className="sr-only">Chat</span>
        <div className="relative h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
          <img src={logoUrl} alt="Chat" className="h-8 w-8 object-contain" />
        </div>
      </button>
    </>
  )
}

export default ChatWidget


