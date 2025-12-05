"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step7Schema, Step7Data, Step7FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export function Step7() {
  const { data, updateData, prevStep, setStep } = useWizardStore()
  
  const form = useForm<Step7FormValues>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      attested: true, // Default to true for UI but user must confirm if we used a checkbox, but here we just show text
      signature: "",
      signatureDate: new Date().toISOString().split('T')[0],
    }
  })

  const onSubmit = (values: Step7FormValues) => {
    const parsed: Step7Data = step7Schema.parse(values)
    updateData("step7", parsed)
    alert("Application Packet Generated! (Mock)")
    console.log("Final Data:", { ...data, step7: parsed })
  }

  // Helper to check status
  const getStatus = (condition: boolean) => {
    return condition 
      ? { icon: <CheckCircle2 className="text-green-500 h-5 w-5" />, text: "Complete", color: "text-green-700" }
      : { icon: <XCircle className="text-red-500 h-5 w-5" />, text: "Missing", color: "text-red-700" }
  }

  const isGeneral = data.step0?.licenseType === "general"
  const hasEmployees = data.step0?.hasEmployees

  const requirements = [
    { 
      label: "Account Setup", 
      valid: !!data.step0?.licenseType && !!data.step0?.firstName,
      step: 0 
    },
    { 
      label: "Pre-Licensure Education", 
      valid: data.step1?.preLicensureCompleted || (data.step1?.exemptions && data.step1.exemptions.length > 0),
      step: 1
    },
    { 
      label: "Business Entity & EIN", 
      valid: !!data.step2?.legalBusinessName && !!data.step2?.federalEin,
      step: 2
    },
    { 
      label: "General Liability Insurance", 
      valid: !!data.step3?.hasGlInsurance,
      step: 3
    },
    { 
      label: "Workers Comp", 
      valid: hasEmployees ? !!data.step3?.hasWorkersComp : !!data.step3?.hasWcWaiver,
      step: 3
    },
    ...(isGeneral ? [{
      label: "Experience / Qualifier",
      valid: !!data.step4?.hasExperience,
      step: 4
    }, {
      label: "Business & Law Exam",
      valid: data.step5?.examStatus === "passed",
      step: 5
    }] : []),
    {
      label: "DOPL Application",
      valid: !!data.step6?.doplAppCompleted,
      step: 6
    }
  ]

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
             <h3 className="text-lg font-medium">Application Checklist</h3>
             <div className="grid gap-2">
                {requirements.map((req, idx) => {
                  const status = getStatus(req.valid as boolean)
                  return (
                    <button 
                      key={req.label || idx}
                      type="button"
                      onClick={() => setStep(req.step)}
                      className="flex items-center justify-between w-full p-3 bg-slate-50 rounded-md border text-left hover:bg-slate-100"
                    >
                       <span className="font-medium">{req.label}</span>
                       <div className="flex items-center gap-2">
                          {status.icon}
                          <span className={`text-sm ${status.color}`}>{status.text}</span>
                       </div>
                    </button>
                  )
                })}
             </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button
          type="button"
          onClick={() => window.open("https://beacontractor.com/contact-us/", "_blank", "noreferrer")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Contact Contractor School team for help
        </Button>
      </CardFooter>
    </Card>
  )
}

