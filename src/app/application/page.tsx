"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useWizardStore } from "@/store/wizard-store"
import { Step0 } from "@/components/wizard/Step0"
import { Step1 } from "@/components/wizard/Step1"
import { Step2 } from "@/components/wizard/Step2"
import { Step3 } from "@/components/wizard/Step3"
import { Step4 } from "@/components/wizard/Step4"
import { Step5 } from "@/components/wizard/Step5"
import { Step6 } from "@/components/wizard/Step6"
import { Step7 } from "@/components/wizard/Step7"
import { fetchWizardData, saveWizardData } from "@/lib/wizard-api"

export default function WizardPage() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [loadingServerData, setLoadingServerData] = useState(false)
  const { currentStep, setStep } = useWizardStore()
  const wizardData = useWizardStore((state) => state.data)
  const updateData = useWizardStore((state) => state.updateData)
  const applicationId = useWizardStore((state) => state.applicationId)
  const setApplicationId = useWizardStore((state) => state.setApplicationId)

  const isAdmin = useMemo(() => {
    const list = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || process.env.ADMIN_EMAIL_ALLOWLIST || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    const metaAdmin = user?.publicMetadata && (user.publicMetadata as Record<string, unknown>).isAdmin === true
    const emails = user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
    return metaAdmin || emails.some((em) => list.includes(em as string))
  }, [user?.emailAddresses, user?.publicMetadata])

  const sectionParam = searchParams.get("section")
  const targetStep = useMemo(() => {
    switch (sectionParam) {
      case "step0":
        return 0
      case "step1":
        return 1
      case "step2":
        return 2
      case "step3":
        return 3
      case "step4":
        return 4
      case "step5":
        return 5
      case "step6":
        return 6
      case "step7":
        return 7
      default:
        return 0
    }
  }, [sectionParam])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAdmin, router])

  // Load saved data (now allowed signed-out with fallback)
  useEffect(() => {
    const load = async () => {
      if (isAdmin) return
      setLoadingServerData(true)
      try {
        const res = await fetchWizardData()
        setApplicationId(res.applicationId || null)
        if (res.data) {
          // hydrate store
          updateData("step0", res.data.step0 || {})
          updateData("step1", res.data.step1 || {})
          updateData("step2", res.data.step2 || {})
          updateData("step3", res.data.step3 || {})
          updateData("step4", res.data.step4 || {})
          updateData("step5", res.data.step5 || {})
          updateData("step6", res.data.step6 || {})
          updateData("step7", res.data.step7 || {})
          setStep(targetStep)
        }
      } catch (e) {
        console.error("Failed to load wizard data", e)
      } finally {
        setLoadingServerData(false)
      }
    }
    load()
  }, [isAdmin, setApplicationId, setStep, targetStep, updateData])

  // respond to section param changes after load
  useEffect(() => {
    if (!isAdmin) {
      setStep(targetStep)
    }
  }, [isAdmin, setStep, targetStep])

  // Auto-save on data changes (requires applicationId)
  useEffect(() => {
    const save = async () => {
      if (!applicationId) return
      try {
        await saveWizardData(wizardData, applicationId)
      } catch (e) {
        console.error("Failed to save wizard data", e)
      }
    }
    // save on every data change (only changes on submit)
    save()
  }, [wizardData, applicationId])

  if (!mounted) return <div className="p-8 text-center">Loading...</div>
  if (loadingServerData) return <div className="p-8 text-center">Loading your saved data...</div>

  const steps = [
    { component: Step0, label: "Setup" },
    { component: Step1, label: "Education" },
    { component: Step2, label: "Business" },
    { component: Step3, label: "Insurance" },
    { component: Step4, label: "Experience" },
    { component: Step5, label: "Exams" },
    { component: Step6, label: "DOPL" },
    { component: Step7, label: "Review" },
  ]

  const CurrentComponent = steps[currentStep]?.component || Step0

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Contractor Licensing Intake</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-slate-900 h-full transition-all duration-300"
              style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
             {steps.map((s, i) => (
               <button
                 key={s.label}
                 type="button"
                 onClick={() => setStep(i)}
                 className={`${i === currentStep ? "font-bold text-slate-900" : ""} hidden md:block hover:text-slate-900`}
               >
                 {s.label}
               </button>
             ))}
             <div className="md:hidden font-bold text-slate-900">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
             </div>
          </div>
        </div>

        <div className="py-4">
          <CurrentComponent />
        </div>
      </div>
    </div>
  )
}


