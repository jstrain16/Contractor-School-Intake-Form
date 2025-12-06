"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, Step3Data, Step3FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { UploadField } from "@/components/wizard/UploadField"

export function Step3() {
  const { data, updateData, nextStep, prevStep, applicationId } = useWizardStore()
  const hasEmployees = data.step0?.hasEmployees

  const form = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      hasGlInsurance: data.step3?.hasGlInsurance || false,
      glCarrier: data.step3?.glCarrier || "",
      glPolicyNumber: data.step3?.glPolicyNumber || "",
      glEffectiveDate: data.step3?.glEffectiveDate || "",
      glExpirationDate: data.step3?.glExpirationDate || "",
      glLimits: data.step3?.glLimits || "",
      contactInsurancePartner: data.step3?.contactInsurancePartner || false,
      insuranceContactRequested: data.step3?.insuranceContactRequested || false,
      
      hasWorkersComp: data.step3?.hasWorkersComp || false,
      wcCarrier: data.step3?.wcCarrier || "",
      wcPolicyNumber: data.step3?.wcPolicyNumber || "",
      wcEffectiveDate: data.step3?.wcEffectiveDate || "",
      wcExpirationDate: data.step3?.wcExpirationDate || "",
      
      hasWcWaiver: data.step3?.hasWcWaiver || false,
    }
  })

  const hasGl = form.watch("hasGlInsurance")
  const hasWc = form.watch("hasWorkersComp")
  const hasWaiver = form.watch("hasWcWaiver")
  const wantsInsuranceContact = form.watch("contactInsurancePartner")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<boolean>(data.step3?.insuranceContactRequested || false)

  useEffect(() => {
    const alreadyRequested = sent || data.step3?.insuranceContactRequested
    if (wantsInsuranceContact && !alreadyRequested && !sending) {
      void sendInsuranceWebhook()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsInsuranceContact])

  const sendInsuranceWebhook = async () => {
    try {
      setSending(true)
      const payload = {
        applicationId,
        step0: data.step0,
        step3: { ...form.getValues(), contactInsurancePartner: true },
        step4: data.step4,
      }
      const res = await fetch("/api/webhook/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const detail = await res.text()
        throw new Error(detail || "Webhook failed")
      }
      updateData("step3", { contactInsurancePartner: true, insuranceContactRequested: true })
      setSent(true)
    } catch (err) {
      console.error("Insurance webhook error", err)
      alert("Could not send your request to Integrated Insurance Solutions. Please try again.")
      form.setValue("contactInsurancePartner", false)
    } finally {
      setSending(false)
    }
  }

  const onSubmit = (values: Step3FormValues) => {
    const parsed: Step3Data = step3Schema.parse(values)
    updateData("step3", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Insurance & Workers Compensation</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step3-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* General Liability */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Liability Insurance</h3>
            <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="hasGlInsurance" 
                 {...form.register("hasGlInsurance")} 
                 className="w-4 h-4 rounded border-gray-300"
               />
               <Label htmlFor="hasGlInsurance" className="mb-0">Do you have active General Liability Insurance?</Label>
            </div>

            {hasGl && (
              <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                <UploadField
                  label="Upload General Liability Certificate (COI)"
                  step={3}
                  fileType="gl_certificate"
                  applicationId={applicationId}
                  accept=".pdf,.jpg,.png"
                />
              </div>
            )}
            {!hasGl && (
              <div className="p-3 bg-slate-50 rounded-md border space-y-2">
                <p className="text-sm">Would you like Integrated Insurance Solutions to contact you with a quote?</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...form.register("contactInsurancePartner")} 
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Yes, please have Integrated Insurance Solutions reach out.</span>
                </label>
                {sent && (
                  <p className="text-xs text-green-700">Request sent. We will reach out soon.</p>
                )}
              </div>
            )}
          </div>

          {/* Workers Compensation */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Workers Compensation</h3>
            
            {hasEmployees ? (
              // Employees = Yes -> Must have WC
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="hasWorkersComp" 
                      {...form.register("hasWorkersComp")} 
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="hasWorkersComp" className="mb-0">Do you have Workers Compensation Insurance?</Label>
                 </div>

                 {hasWc && (
                    <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wcCarrier">Carrier Name</Label>
                          <Input id="wcCarrier" {...form.register("wcCarrier")} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wcPolicyNumber">Policy Number</Label>
                          <Input id="wcPolicyNumber" {...form.register("wcPolicyNumber")} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wcEffectiveDate">Effective Date</Label>
                          <Input id="wcEffectiveDate" type="date" {...form.register("wcEffectiveDate")} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wcExpirationDate">Expiration Date</Label>
                          <Input id="wcExpirationDate" type="date" {...form.register("wcExpirationDate")} />
                        </div>
                      </div>
                      <UploadField
                        label="Upload Workers Comp Certificate"
                        step={3}
                        fileType="wc_certificate"
                        applicationId={applicationId}
                        accept=".pdf,.jpg,.png"
                      />
                    </div>
                 )}

              </div>
            ) : (
              // Employees = No -> Waiver
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-base">Do you have a Workers Compensation Waiver?</Label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          value="yes" 
                          checked={hasWaiver === true}
                          onChange={() => form.setValue("hasWcWaiver", true)}
                          className="w-4 h-4" 
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          value="no" 
                          checked={hasWaiver === false}
                          onChange={() => form.setValue("hasWcWaiver", false)}
                          className="w-4 h-4" 
                        />
                        <span>No</span>
                      </label>
                   </div>
                </div>

                {hasWaiver ? (
                  <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                    <UploadField
                      label="Upload Workers Comp Waiver"
                      step={3}
                      fileType="wc_waiver"
                      applicationId={applicationId}
                      accept=".pdf,.jpg,.png"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                    You will need to obtain a Workers Compensation Waiver at <a href="https://laborcommission.utah.gov/divisions/industrialaccidents/employers/wc-coverage-waivers/" target="_blank" rel="noreferrer" className="underline font-medium">the Utah Labor Commission</a>.
                  </div>
                )}
              </div>
            )}
          </div>

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step3-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}

