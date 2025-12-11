"use client"

import { useCallback } from "react"

type ChatWidgetAPI = {
  openWithPrompt: (prompt: string) => void
}

declare global {
  interface Window {
    __chatWidgetOpen?: () => void
    __chatWidgetSetPrompt?: (prompt: string) => void
  }
}

export function useChatWidget(): ChatWidgetAPI {
  const openWithPrompt = useCallback((prompt: string) => {
    if (typeof window === "undefined") return
    window.__chatWidgetSetPrompt?.(prompt)
    window.__chatWidgetOpen?.()
  }, [])

  return { openWithPrompt }
}


