"use client"

import { SignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function SignInPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isSignedIn || redirecting) return

    const redirectUrl =
      searchParams.get("redirect_url") ||
      searchParams.get("redirectUrl") ||
      searchParams.get("returnUrl")

    if (redirectUrl) {
      router.replace(redirectUrl)
      return
    }

    const go = async () => {
      setRedirecting(true)
      try {
        const res = await fetch("/api/profile/ensure", { method: "POST" })
        const json = await res.json().catch(() => null)
        const role = (json?.profile?.role || "").toLowerCase()
        const target = role === "super_admin" || role === "admin" ? "/admin" : "/dashboard"
        router.replace(target)
      } catch (e) {
        console.error("post-sign-in redirect failed", e)
        router.replace("/dashboard")
      } finally {
        setRedirecting(false)
      }
    }

    go()
  }, [isSignedIn, redirecting, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignIn path="/sign-in" routing="path" />
    </div>
  )
}

