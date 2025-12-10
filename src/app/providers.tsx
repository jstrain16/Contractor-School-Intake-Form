"use client"

import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs"
import Link from "next/link"
import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Shield } from "lucide-react"
import ChatWidget from "@/components/chat/ChatWidget"

type ProvidersProps = {
  children: ReactNode
}

function AdminPortalButton() {
  const { user } = useUser()
  const [apiAllowed, setApiAllowed] = useState<boolean | null>(null)
  const adminAllowlist = useMemo(() => {
    const list = process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || ""
    return list
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  }, [])
  const isAdmin = useMemo(() => {
    const metaAdmin = user?.publicMetadata && (user.publicMetadata as Record<string, unknown>).isAdmin === true
    if (metaAdmin) return true
    const emails =
      user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
    return emails.some((em) => adminAllowlist.includes(em as string))
  }, [adminAllowlist, user?.emailAddresses, user?.publicMetadata])

  useEffect(() => {
    let mounted = true
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((j) => {
        if (mounted) setApiAllowed(Boolean(j?.isAllowed))
      })
      .catch(() => {
        if (mounted) setApiAllowed(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  const allowed = isAdmin || apiAllowed
  if (!allowed) return null

  return (
    <Link
      href="/admin/settings"
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/40 hover:translate-y-[-1px]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white shadow-inner shadow-orange-900/20 transition-transform duration-200 group-hover:scale-105">
        <Shield className="h-4 w-4" />
      </span>
      <span className="leading-none">Admin Portal</span>
    </Link>
  )
}

export function Providers({ children }: ProvidersProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <div className="p-6 text-sm text-red-600">
        Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to .env.local and restart the dev server.
      </div>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <ClerkLoading>
        <div className="p-4 text-sm text-slate-600">Loading account...</div>
      </ClerkLoading>
      <ClerkLoaded>
        <header className="flex justify-between items-center px-5 py-3 h-16 bg-white text-slate-900 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
              <span className="text-lg font-semibold">CS</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">CONTRACTORS SCHOOL</p>
              <p className="text-xs text-slate-500">Licensing Specialists</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-slate-800 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <AdminPortalButton />
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "border border-slate-200 shadow-sm",
                  },
                }}
              />
            </SignedIn>
          </div>
        </header>
        <EnsureProfileOnce />
        {children}
        <ChatWidget />
      </ClerkLoaded>
    </ClerkProvider>
  )
}

function EnsureProfileOnce() {
  const called = useRef(false)
  useEffect(() => {
    if (called.current) return
    called.current = true
    fetch("/api/profile/ensure", { method: "POST" }).catch((e) => {
      console.warn("ensure profile failed", e)
    })
  }, [])
  return null
}

