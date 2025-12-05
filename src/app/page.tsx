"use client"

import { useEffect, useState } from "react"
import { useWizardStore } from "@/store/wizard-store"
import { Step0 } from "@/components/wizard/Step0"
import { Step1 } from "@/components/wizard/Step1"
import { Step2 } from "@/components/wizard/Step2"
import { Step3 } from "@/components/wizard/Step3"
import { Step4 } from "@/components/wizard/Step4"
import { Step5 } from "@/components/wizard/Step5"
import { Step6 } from "@/components/wizard/Step6"
import { Step7 } from "@/components/wizard/Step7"
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { fetchWizardData, saveWizardData } from "@/lib/wizard-api"

export default function WizardPage() {
  const [mounted, setMounted] = useState(false)
  const [loadingServerData, setLoadingServerData] = useState(false)
  const { user, isSignedIn } = useUser()
  const { currentStep, reset, setStep } = useWizardStore()
  const wizardData = useWizardStore((state) => state.data)
  const updateData = useWizardStore((state) => state.updateData)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved data when signed in
  useEffect(() => {
    const load = async () => {
      if (!isSignedIn) return
      setLoadingServerData(true)
      try {
        const res = await fetchWizardData()
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
          setStep(0)
        }
      } catch (e) {
        console.error("Failed to load wizard data", e)
      } finally {
        setLoadingServerData(false)
      }
    }
    load()
  }, [isSignedIn, updateData, setStep])

  // Auto-save on data changes when signed in
  useEffect(() => {
    const save = async () => {
      if (!isSignedIn) return
      try {
        await saveWizardData(wizardData as Record<string, any>)
      } catch (e) {
        console.error("Failed to save wizard data", e)
      }
    }
    // save on every data change (only changes on submit)
    save()
  }, [wizardData, isSignedIn])

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
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm text-blue-600 underline">Clerk Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm text-blue-600 underline">Clerk Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <button 
                onClick={() => { if(confirm('Are you sure you want to reset all form data?')) reset() }} 
                className="text-sm text-red-600 hover:underline"
              >
                Reset Form
              </button>
            </SignedIn>
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

        <SignedOut>
          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <p className="text-slate-800 mb-4">Please sign in to continue.</p>
            <div className="flex gap-3">
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-md border border-slate-300 text-sm">Sign Up</button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="py-4">
            <CurrentComponent />
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
