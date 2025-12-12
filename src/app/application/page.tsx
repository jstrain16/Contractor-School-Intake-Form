"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useWizardStore } from "@/store/wizard-store"
import { Step0 } from "@/components/wizard/Step0"
import { Step0License } from "@/components/wizard/Step0License"
import { Step1 } from "@/components/wizard/Step1"
import { Step2 } from "@/components/wizard/Step2"
import { Step3 } from "@/components/wizard/Step3"
import { Step4 } from "@/components/wizard/Step4"
import { Step5 } from "@/components/wizard/Step5"
import { Step6 } from "@/components/wizard/Step6"
import { Step7 } from "@/components/wizard/Step7"
import { StepClass } from "@/components/wizard/StepClass"
import { StepScreeningInline } from "@/components/wizard/StepScreeningInline"
import { StepAssistanceInline } from "@/components/wizard/StepAssistanceInline"
import { StepPlaceholder } from "@/components/wizard/StepPlaceholder"
import { SupportingMaterialsInline } from "@/components/supporting-materials/SupportingMaterialsInline"
import { fetchWizardData, saveWizardData } from "@/lib/wizard-api"

export default function WizardPage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [loadingServerData, setLoadingServerData] = useState(false)
  const { currentStep, setStep } = useWizardStore()
  const wizardData = useWizardStore((state) => state.data)
  const updateData = useWizardStore((state) => state.updateData)
  const applicationId = useWizardStore((state) => state.applicationId)
  const setApplicationId = useWizardStore((state) => state.setApplicationId)
  const resetStore = useWizardStore((state) => state.reset)
  const [sfStatus, setSfStatus] = useState<"loading" | "match" | "nomatch" | "error">("loading")
  const [sfAccountName, setSfAccountName] = useState<string | null>(null)

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

  // Reset wizard store when user changes to avoid cross-user prefill
  useEffect(() => {
    if (isLoaded && user?.id) {
      resetStore()
    }
  }, [isLoaded, user?.id, resetStore])

  useEffect(() => {
    if (!mounted || !isLoaded || redirecting) return
    if (!isSignedIn) {
      setRedirecting(true)
      router.replace(`/sign-in?redirect_url=${encodeURIComponent("/application")}`)
      return
    }
  }, [isLoaded, isSignedIn, mounted, redirecting, router])

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAdmin, router])

  useEffect(() => {
    const checkSf = async () => {
      try {
        const res = await fetch("/api/salesforce/check-contact")
        if (!res.ok) throw new Error("sf check failed")
        const data = await res.json()
        setSfStatus(data.matched ? "match" : "nomatch")
        if (data.accountName) {
          setSfAccountName(data.accountName as string)
        } else {
          setSfAccountName(null)
        }
      } catch (err) {
        console.error(err)
        setSfStatus("error")
      }
    }
    checkSf()
  }, [])

  // Load saved data
  useEffect(() => {
    const load = async () => {
      if (!isSignedIn || isAdmin) return
      setLoadingServerData(true)
      try {
        const res = await fetchWizardData()
        setApplicationId(res.applicationId || null)
        if (res.data) {
          const enriched = { ...res.data }
          // Prefill account info from Clerk if missing
          const step0 = { ...(enriched.step0 || {}) }
          if (user?.firstName && !step0.firstName) step0.firstName = user.firstName
          if (user?.lastName && !step0.lastName) step0.lastName = user.lastName
          if (user?.primaryEmailAddress?.emailAddress && !step0.email) {
            step0.email = user.primaryEmailAddress.emailAddress
          }
          enriched.step0 = step0

          updateData("step0", enriched.step0 || {})
          updateData("step1", enriched.step1 || {})
          updateData("step2", enriched.step2 || {})
          updateData("step3", enriched.step3 || {})
          updateData("step4", enriched.step4 || {})
          updateData("step5", enriched.step5 || {})
          updateData("step6", enriched.step6 || {})
          updateData("step7", enriched.step7 || {})
          setStep(targetStep)
        }
      } catch (e) {
        console.error("Failed to load wizard data", e)
      } finally {
        setLoadingServerData(false)
      }
    }
    load()
  }, [isAdmin, isSignedIn, setApplicationId, setStep, targetStep, updateData, user?.firstName, user?.lastName, user?.primaryEmailAddress])

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

  if (!mounted || !isLoaded || redirecting) return <div className="p-8 text-center">Loading...</div>
  if (loadingServerData) return <div className="p-8 text-center">Loading your saved data...</div>

  const steps: { component: React.ComponentType<any>; label: string; props?: Record<string, unknown> }[] = [
    { component: Step0, label: "Account" },
    { component: Step0License, label: "Licenses" },
    { component: StepClass, label: "Class" },
    { component: StepScreeningInline, label: "Screening" },
    { component: SupportingMaterialsInline, label: "Supporting Materials" },
    { component: StepAssistanceInline, label: "Assistance" },
    { component: Step2, label: "Business" },
    { component: StepPlaceholder, label: "FEIN", props: { title: "FEIN Status", description: "Upload or request CP 575; instructions forthcoming." } },
    { component: StepPlaceholder, label: "Bank", props: { title: "Business Bank Account", description: "Upload voided check or bank letter; instructions forthcoming." } },
    { component: StepPlaceholder, label: "Owners", props: { title: "Owners", description: "Collect owner info and ensure 100% ownership; coming soon." } },
    { component: Step3, label: "Workers Comp" },
    { component: StepPlaceholder, label: "Qualifier", props: { title: "Qualifier Identification", description: "Qualifier details and affidavit upload; coming soon." } },
    { component: StepPlaceholder, label: "Insurance Prep", props: { title: "Insurance Prep", description: "Notify insurance partner; COI upload placeholder." } },
    { component: StepPlaceholder, label: "Waiver Prep", props: { title: "Waiver Prep", description: "Workers comp waiver prep checklist." } },
    { component: StepPlaceholder, label: "Class Complete", props: { title: "Class Completion", description: "Track class completion status." } },
    { component: Step5, label: "Exam" },
    { component: StepPlaceholder, label: "Insurance Active", props: { title: "Insurance Activation", description: "Mark insurance active; COI upload by staff." } },
    { component: StepPlaceholder, label: "Waiver/Submit", props: { title: "Waiver & Submission", description: "Waiver upload, final assembly, review, submission tracking." } },
  ]

  const CurrentComponent = steps[currentStep]?.component || Step0
  const currentProps = steps[currentStep]?.props || {}

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900">Contractor Licensing Intake</h1>
          <p className="text-sm text-slate-600">Complete all sections to submit your application</p>
        </div>

        <div className="flex justify-end">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
            {sfStatus === "match" ? (
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1024px-Salesforce.com_logo.svg.png"
                alt="Salesforce linked"
                className="h-6 w-auto"
              />
            ) : (
              <span className="text-lg font-semibold text-red-500">X</span>
            )}
            <span className="text-xs font-semibold text-slate-700">
              {sfStatus === "loading" && "Checking..."}
              {sfStatus === "match" &&
                (sfAccountName ? `Salesforce: ${sfAccountName}` : "Salesforce contact found")}
              {sfStatus === "nomatch" && "No Salesforce contact"}
              {sfStatus === "error" && "Check failed"}
            </span>
          </div>
        </div>

        {/* Step tracker */}
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {steps.map((s, i) => {
              const active = i === currentStep
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setStep(i)}
                  className="flex flex-1 min-w-[90px] flex-col items-center gap-2 focus:outline-none"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        active ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      active ? "text-orange-600" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-0">
          <CurrentComponent {...currentProps} />
        </div>

        <div className="text-center text-sm text-slate-600">
          Need help?{" "}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Contact Support
          </button>
        </div>
      </main>
    </div>
  )
}


