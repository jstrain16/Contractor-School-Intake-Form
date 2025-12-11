import { useEffect, useState, useCallback } from "react"

export type NotificationItem = {
  id: string
  title: string
  message: string | null
  type: string | null
  link: string | null
  read: boolean
  created_at: string
}

export function useNotifications(pollMs = 30000) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/notifications")
      if (!res.ok) throw new Error("Failed to load notifications")
      const data = await res.json()
      setItems(data.notifications || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      })
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      // ignore errors for now
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const t = setInterval(fetchNotifications, pollMs)
    return () => clearInterval(t)
  }, [fetchNotifications, pollMs])

  const unreadCount = items.filter((n) => !n.read).length

  return { items, unreadCount, loading, error, refresh: fetchNotifications, markRead }
}
