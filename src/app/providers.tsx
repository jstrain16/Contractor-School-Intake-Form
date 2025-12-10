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
import { Bell, Cog, Shield, Users, ArrowLeft } from "lucide-react"
import ChatWidget from "@/components/chat/ChatWidget"

type ProvidersProps = {
  children: ReactNode
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
        <GlobalHeader />
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

function GlobalHeader() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 text-slate-900">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">Settings</div>
          <div className="text-sm text-slate-500">System Configuration</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-orange-500" />
        </div>
        <Link
          href="/admin/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          aria-label="Settings"
        >
          <Cog className="h-5 w-5" />
        </Link>
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton>
              <button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-3">
            <AdminPortalBadge />
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "border border-slate-200 shadow-sm",
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </header>
  )
}

function AdminPortalBadge() {
  const { user } = useUser()
  const emails = user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
  const name = user?.fullName || emails[0] || "Admin"
  return (
    <div className="flex items-center gap-2 rounded-full bg-blue-500 px-3 py-2 text-white">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
        <Shield className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-[11px] text-white/80">Admin</div>
      </div>
    </div>
  )
}

