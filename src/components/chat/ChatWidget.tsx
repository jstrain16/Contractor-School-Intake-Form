"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ChatKit, useChatKit } from "@openai/chatkit-react"
import { MessageCircle } from "lucide-react"
import { useRef } from "react"
import { LoaderThree } from "@/components/ui/loader"

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
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const sessionPromise = useRef<Promise<string> | null>(null)
  const [showNudge, setShowNudge] = useState(false)
  const [shouldForceOpen, setShouldForceOpen] = useState(false)
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null)

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissed = window.localStorage.getItem("chat-nudge-dismissed")
    if (dismissed === "true") return
    const stored = window.localStorage.getItem("wizard-storage")
    if (!stored) {
      setShowNudge(true)
      return
    }
    try {
      const parsed = JSON.parse(stored)
      const step7 = parsed?.state?.data?.step7
      const attested = step7?.attested && step7?.signature
      setShowNudge(!attested)
    } catch {
      setShowNudge(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hasGlobal = () => Boolean((window as any).ChatKit)
    if (hasGlobal()) {
      setSdkReady(true)
      return
    }

    // Fallback: dynamically load script if not yet loaded
    const existing = document.querySelector('script[data-chatkit="true"]') as HTMLScriptElement | null
    if (!existing) {
      const script = document.createElement("script")
      script.src = "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
      script.async = true
      script.dataset.chatkit = "true"
      script.onload = () => setSdkReady(true)
      script.onerror = () => setSdkError("Chat SDK failed to load")
      document.body.appendChild(script)
    }

    const timer = setInterval(() => {
      if (hasGlobal()) {
        setSdkReady(true)
        clearInterval(timer)
      }
    }, 200)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.__chatWidgetSetPrompt = (prompt: string) => {
      setSuggestedPrompt(prompt)
    }
    window.__chatWidgetOpen = () => {
      setShouldForceOpen(true)
      setOpen(true)
      setShowNudge(false)
    }
    return () => {
      window.__chatWidgetSetPrompt = undefined
      window.__chatWidgetOpen = undefined
    }
  }, [])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing
        if (sessionPromise.current) return sessionPromise.current

        setLoading(true)
        sessionPromise.current = (async () => {
          const res = await fetch("/api/chatkit/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId }),
          })
          if (!res.ok) {
            const text = await res.text().catch(() => "Failed to create ChatKit session")
            setError(text || "Failed to create ChatKit session")
            setLoading(false)
            sessionPromise.current = null
            throw new Error(text)
          }
          const json = await res.json()
          const client_secret = json?.client_secret
          if (!client_secret) {
            const msg = "No client_secret returned from chat session"
            setError(msg)
            setLoading(false)
            sessionPromise.current = null
            throw new Error(msg)
          }
          setLoading(false)
          return client_secret as string
        })()

        return sessionPromise.current
      },
    },
  })

  const isAdminRoute = pathname?.startsWith("/admin")
  if (isAdminRoute || isAdmin) return null

  const dismissNudge = () => {
    setShowNudge(false)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("chat-nudge-dismissed", "true")
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 w-80 h-[520px] rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
          {error && <div className="p-4 text-sm text-red-600">Chat unavailable: {error}</div>}
          {!error && sdkError && <div className="p-4 text-sm text-red-600">{sdkError}</div>}
          {!error && !sdkError && !sdkReady && <div className="p-8 flex justify-center"><LoaderThree /></div>}
          {!error && !sdkError && sdkReady && loading && <div className="p-8 flex justify-center"><LoaderThree /></div>}
          {!error && !sdkError && sdkReady && !loading && <ChatKit control={control} className="h-full w-full" />}
          {!error && !sdkError && suggestedPrompt && (
            <div className="absolute top-3 right-3 z-50 max-w-[260px] rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg p-3 text-xs text-slate-800 space-y-2">
              <div className="font-semibold text-slate-900">Try asking:</div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-700">{suggestedPrompt}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-md bg-orange-500 text-white px-2 py-1 font-semibold hover:bg-orange-600"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(suggestedPrompt)
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  Copy to chat
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:text-slate-800"
                  onClick={() => setSuggestedPrompt(null)}
                >
                  Dismiss
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                Paste into the chat box and send.
              </div>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => {
          setOpen((v) => !v)
          dismissNudge()
        }}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg border border-slate-200 bg-white hover:shadow-xl transition ${
          showNudge ? "animate-bounce" : ""
        }`}
      >
        <span className="sr-only">Chat</span>
        <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center">
          <MessageCircle className="h-6 w-6" />
        </div>
      </button>
      {showNudge && !open && (
        <div className="fixed bottom-24 right-4 z-50 max-w-xs rounded-lg border border-slate-200 bg-white shadow-xl p-3 text-sm text-slate-800">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500" />
            <div className="flex-1">
              Ask me anything about the licensing process.
            </div>
            <button
              type="button"
              aria-label="Dismiss chat hint"
              onClick={dismissNudge}
              className="text-slate-500 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget


