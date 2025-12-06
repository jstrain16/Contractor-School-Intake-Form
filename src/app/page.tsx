"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { Hammer } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWizardData } from "@/lib/wizard-api"
import { useWizardStore } from "@/store/wizard-store"
import { WizardData } from "@/lib/schemas"
import { buildStatus } from "@/lib/progress"

export default function HomePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wizardData, setWizardData] = useState<Partial<WizardData> | null>(null)
  const resetStore = useWizardStore((s) => s.reset)
  const setApplicationId = useWizardStore((s) => s.setApplicationId)

  const statusList = useMemo(() => buildStatus(wizardData), [wizardData])
  const isAdmin = useMemo(() => {
    const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    const metaAdmin = user?.publicMetadata && (user.publicMetadata as Record<string, unknown>).isAdmin === true
    const emails = user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
    return metaAdmin || emails.some((em) => allowlist.includes(em as string))
  }, [user?.emailAddresses, user?.publicMetadata])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace("/sign-in")
      return
    }
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAdmin, isLoaded, isSignedIn, router])

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !isSignedIn) return
      if (isAdmin) {
        setLoading(false)
        return
      }
      try {
        const res = await fetchWizardData()
        setWizardData((res.data || null) as Partial<WizardData> | null)
        setApplicationId(res.applicationId || null)
      } catch (err) {
        console.error(err)
        setError("Could not load your application status.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin, isLoaded, isSignedIn, setApplicationId])

  // If this is a brand-new user with zero progress, send them straight to the application setup.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || loading || isAdmin) return
    if (statusList.progress === 0) {
      router.replace("/application")
    }
  }, [isAdmin, isLoaded, isSignedIn, loading, statusList.progress, router])

  const progressPct = statusList.progress
  const nextStepLabel = statusList.nextUp

  const handleContinue = () => {
    router.push("/application")
  }

  const handleNewApplication = async () => {
    setSaving(true)
    setError(null)
    try {
      resetStore()
      const res = await fetchWizardData() // will create if missing
      setWizardData((res.data || null) as Partial<WizardData> | null)
      setApplicationId(res.applicationId || null)
      router.push("/application")
    } catch (err) {
      console.error(err)
      setError("Could not start a new application right now.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-slate-800 shadow-lg">
              <span className="text-white text-lg font-semibold">CS</span>
            </div>
          <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Contractor School</h1>
              <p className="mt-1 text-sm md:text-base text-slate-600">
                Track your licensing intake, progress, and documents in one place.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {!isAdmin && (
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30 hover:shadow-md"
                >
                  Go to Application
                </Button>
              )}
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin")}
                  className="bg-gradient-to-r from-orange-500 to-slate-800 text-white shadow-sm shadow-orange-500/30 hover:shadow-md"
                >
                  Go to Admin Portal
                </Button>
              )}
            </SignedIn>
          </div>
        </div>

        <SignedIn>
          {/* Overall progress */}
          {!isAdmin && (
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-lg">
                      <Hammer className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Progress</p>
                      <p className="text-lg font-bold text-slate-900">{progressPct}% complete</p>
                    </div>
                  </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  Next up: <span className="font-semibold text-slate-800">{nextStepLabel}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-sm text-slate-600">Loading your status...</div>
              ) : (
                <>
                  <div className="relative h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {statusList.items.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                item.done ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-orange-600"
                              }`}
                            />
                            <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              item.done ? "text-green-700 bg-green-50" : "text-amber-700 bg-amber-50"
                            } px-2 py-0.5 rounded-full`}
                          >
                          {item.done ? "Complete" : "Pending"}
                        </span>
                        </div>
                        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              item.done ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-orange-600"
                            }`}
                            style={{ width: item.done ? "100%" : "0%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30 hover:shadow-md"
              >
                Continue Application
              </Button>
              <Button variant="outline" disabled={saving} onClick={handleNewApplication}>
                {saving ? "Starting..." : "Start New Application"}
              </Button>
            </CardFooter>
          </Card>
          )}

          {/* Quick stats */}
          {!isAdmin && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">{progressPct}%</div>
                  <p className="text-sm text-slate-600">Weighted completion across all sections.</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Next Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-lg font-semibold text-slate-900">{nextStepLabel}</div>
                  <p className="text-sm text-slate-600">Complete the next section to move forward.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">Sign in to start or resume your application.</p>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </CardContent>
            <CardFooter className="flex gap-3">
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline">Create Account</Button>
              </SignUpButton>
            </CardFooter>
          </Card>
        </SignedOut>
      </div>
    </div>
  )
}
