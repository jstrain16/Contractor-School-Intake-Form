"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { CheckCircle2, Circle, GraduationCap, HelpCircle, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWizardData } from "@/lib/wizard-api"
import { WizardData } from "@/lib/schemas"
import { buildStatus } from "@/lib/progress"

export default function DashboardPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [wizardData, setWizardData] = useState<Partial<WizardData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      return
    }
    const load = async () => {
      try {
        const res = await fetchWizardData()
        setWizardData((res.data || null) as Partial<WizardData> | null)
      } catch (err) {
        console.error(err)
        setError("Could not load your dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin, isLoaded, isSignedIn, router])

  const statusList = useMemo(() => buildStatus(wizardData), [wizardData])
  const progressPct = statusList.progress
  const nextUp = statusList.nextUp

  const goToApplication = () => router.push("/application")

  const steps = statusList.items

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 space-y-8">
        {/* Intro / CTA */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900">Contractor School</p>
              <p className="text-sm text-slate-600">Track your licensing intake, progress, and documents in one place.</p>
            </div>
            <Button
              onClick={goToApplication}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Go to Application
            </Button>
          </div>
        </Card>

        {/* Progress */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span>Overall Progress</span>
              <span className="text-slate-500">Next up: <span className="text-slate-800">{nextUp}</span></span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-sm font-semibold text-slate-800">{progressPct}% complete</div>
          </div>
        </Card>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((item) => {
            const isComplete = item.done
            const statusLabel = isComplete ? "Complete" : "Pending"
            const statusColor = isComplete ? "text-green-700 bg-green-50" : "text-orange-700 bg-orange-50"
            const barColor = isComplete ? "bg-green-500" : "bg-slate-300"
            return (
              <Card key={item.label} className="border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-900">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: isComplete ? "100%" : "20%" }} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            onClick={goToApplication}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Continue Application
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Progress</p>
              <div className="text-4xl font-bold text-slate-900">{progressPct}</div>
              <p className="text-xs text-slate-600">Weighted completion across all sections</p>
            </div>
          </Card>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Next Action</p>
              <div className="text-lg font-semibold text-slate-900">{nextUp}</div>
              <p className="text-xs text-slate-600">Complete the next section to move forward.</p>
            </div>
          </Card>
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </main>

      {/* Floating help */}
      <button
        type="button"
        onClick={() => router.push("/application")}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  )
}

