"use client"

import { SignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { fetchWizardData } from "@/lib/wizard-api"

export default function SignInPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isSignedIn || redirecting) return

    const rawRedirect =
      searchParams.get("redirect_url") ||
      searchParams.get("redirectUrl") ||
      searchParams.get("returnUrl")

    const normalizedRedirect = (() => {
      if (!rawRedirect) return null
      try {
        const url = new URL(rawRedirect, window.location.origin)
        if (url.pathname === "/" || url.pathname === "") return null
        return url.toString()
      } catch {
        return null
      }
    })()

    if (normalizedRedirect) {
      router.replace(normalizedRedirect)
      return
    }

    const go = async () => {
      setRedirecting(true)
      try {
        const res = await fetch("/api/profile/ensure", { method: "POST" })
        const json = await res.json().catch(() => null)
        const role = (json?.profile?.role || "").toLowerCase()
        if (role === "super_admin" || role === "admin") {
          router.replace("/admin")
          return
        }

        // applicant: decide dashboard vs first application step
        try {
          const wizard = await fetchWizardData()
          const hasStarted = Boolean(wizard?.applicationId || wizard?.data)
          const target = hasStarted ? "/dashboard" : "/application"
          router.replace(target)
        } catch {
          router.replace("/dashboard")
        }
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

