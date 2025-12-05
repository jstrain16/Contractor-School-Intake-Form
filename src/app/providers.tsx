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
import Image from "next/image"
import type { ReactNode } from "react"
import { useMemo } from "react"
import { Shield } from "lucide-react"

type ProvidersProps = {
  children: ReactNode
}

function AdminPortalButton() {
  const { user } = useUser()
  const adminAllowlist = useMemo(() => {
    const list = process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || ""
    return list
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  }, [])
  const isAdmin = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
    return email ? adminAllowlist.includes(email) : false
  }, [adminAllowlist, user?.primaryEmailAddress?.emailAddress])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
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
        <header className="flex justify-between items-center p-4 gap-4 h-16 bg-white text-slate-900 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://beacontractor.com/wp-content/uploads/2021/08/logo.svg"
                alt="Beacon Contractor"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-sm font-semibold text-slate-800">Contractor Licensing Intake</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <AdminPortalButton />
              <UserButton />
            </SignedIn>
          </div>
        </header>
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  )
}

