"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWizardData, saveWizardData } from "@/lib/wizard-api"
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
    const load = async () => {
      if (!isLoaded) return
      if (!isSignedIn) {
        setWizardData(null)
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
  }, [isLoaded, isSignedIn, setApplicationId])

  const statusList: StatusItem[] = useMemo(() => {
    const d = wizardData || {}
    const isGeneral = d.step0?.licenseType === "general"
    return [
      { label: "Account Setup", done: !!d.step0?.firstName && !!d.step0?.licenseType && !!d.step0?.email },
      { label: "Pre-Licensure / Exemption", done: !!d.step1?.preLicensureCompleted || (d.step1?.exemptions?.length ?? 0) > 0 },
      { label: "Business Entity & EIN", done: !!d.step2?.legalBusinessName && !!d.step2?.federalEin },
      { label: "General Liability", done: d.step3?.hasGlInsurance === true },
      { label: "Workers Compensation", done: (d.step0?.hasEmployees ? d.step3?.hasWorkersComp === true : d.step3?.hasWcWaiver === true) },
      { label: "Experience / Qualifier", done: isGeneral ? !!d.step4?.hasExperience : true },
      { label: "Business & Law Exam", done: isGeneral ? d.step5?.examStatus === "passed" : true },
      { label: "DOPL Application", done: d.step6?.doplAppCompleted === true },
    ]
  }, [wizardData])

  const total = statusList.length
  const completed = statusList.filter((s) => s.done).length
  const progressPct = Math.round((completed / total) * 100)
  const nextStepLabel = statusList.find((s) => !s.done)?.label ?? "Review & Submit"

  const handleContinue = () => {
    router.push("/wizard")
  }

  const handleNewApplication = async () => {
    setSaving(true)
    setError(null)
    try {
      resetStore()
      if (isSignedIn) {
        const res = await fetchWizardData() // will create if missing
        setWizardData((res.data || null) as Partial<WizardData> | null)
        setApplicationId(res.applicationId || null)
      }
      router.push("/wizard")
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
                    {statusList.map((item) => (
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
