"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWizardData } from "@/lib/wizard-api"
import { useWizardStore } from "@/store/wizard-store"
import { WizardData } from "@/lib/schemas"

type StatusItem = {
  label: string
  done: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wizardData, setWizardData] = useState<Partial<WizardData> | null>(null)
  const resetStore = useWizardStore((s) => s.reset)
  const setApplicationId = useWizardStore((s) => s.setApplicationId)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !isSignedIn) return
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
  }, [isLoaded, isSignedIn, setApplicationId])

  const statusList = useMemo(() => {
    const d = wizardData || {}
    const isGeneral = d.step0?.licenseType === "general"
    const weights = {
      licenseSetup: 5,
      preLicensure: 15,
      business: 25,
      gl: 9, // part of insurance total 20
      wc: 11, // part of insurance total 20
      experience: 10,
      exams: 10,
      dopl: 2,
    }

    const items: Array<StatusItem & { weight: number }> = [
      {
        label: "Account Setup",
        done: !!d.step0?.firstName && !!d.step0?.licenseType && !!d.step0?.email,
        weight: weights.licenseSetup,
      },
      {
        label: "Pre-Licensure / Education",
        done: !!d.step1?.preLicensureCompleted || (d.step1?.exemptions?.length ?? 0) > 0,
        weight: weights.preLicensure,
      },
      {
        label: "Business Entity, FEIN & Banking",
        done: !!d.step2?.legalBusinessName && !!d.step2?.federalEin,
        weight: weights.business,
      },
      {
        label: "General Liability",
        done: d.step3?.hasGlInsurance === true,
        weight: weights.gl,
      },
      {
        label: "Workers Compensation",
        done: d.step0?.hasEmployees ? d.step3?.hasWorkersComp === true : d.step3?.hasWcWaiver === true,
        weight: weights.wc,
      },
      {
        label: "Experience / Qualifier",
        done: isGeneral ? !!d.step4?.hasExperience : true,
        weight: weights.experience,
      },
      {
        label: "Business & Law Exam",
        done: isGeneral ? d.step5?.examStatus === "passed" : true,
        weight: weights.exams,
      },
      {
        label: "DOPL Application",
        done: d.step6?.doplAppCompleted === true,
        weight: weights.dopl,
      },
    ]

    const rawTotal = items.reduce((sum, item) => sum + item.weight, 0)
    const rawCompleted = items.filter((i) => i.done).reduce((sum, item) => sum + item.weight, 0)
    const progress = rawTotal > 0 ? Math.round((rawCompleted / rawTotal) * 100) : 0

    return {
      items,
      progress,
      nextUp: items.find((s) => !s.done)?.label ?? "Review & Submit",
    }
  }, [wizardData])

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contractor School</h1>
            <p className="text-slate-600 text-sm">Track your licensing intake and pick up where you left off.</p>
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
              <Button variant="outline" size="sm" onClick={handleContinue}>Go to Application</Button>
            </SignedIn>
          </div>
        </div>

        <SignedIn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Application Status</span>
                <span className="text-sm font-normal text-slate-600">{progressPct}% complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-sm text-slate-600">Loading your status...</div>
              ) : (
                <>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-900 h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {statusList.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-md border px-3 py-2 bg-white">
                        <span className="text-sm text-slate-800">{item.label}</span>
                        <span className={`text-xs font-medium ${item.done ? "text-green-700" : "text-amber-700"}`}>
                          {item.done ? "Complete" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-slate-700">
                    Next up: <span className="font-medium">{nextStepLabel}</span>
                  </div>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button onClick={handleContinue}>Continue Application</Button>
              <Button variant="outline" disabled={saving} onClick={handleNewApplication}>
                {saving ? "Starting..." : "Start New Application"}
              </Button>
            </CardFooter>
          </Card>
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
