"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step6Schema, Step6Data, Step6FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { UploadField } from "@/components/wizard/UploadField"

export function Step6() {
  const { data, updateData, nextStep, prevStep, applicationId } = useWizardStore()
  const isGeneral = (data.step0?.generalLicenses?.length ?? 0) > 0 || data.step0?.licenseType === "general"
  const hasLicenseSelection =
    (data.step0?.generalLicenses?.length ?? 0) + (data.step0?.specialtyLicenses?.length ?? 0) > 0 ||
    !!data.step0?.licenseType
  const prereqsMet =
    !!data.step0?.firstName &&
    hasLicenseSelection &&
    (data.step1?.preLicensureCompleted || (data.step1?.exemptions?.length ?? 0) > 0) &&
    (!!data.step2?.hasEntityRegistered || true) &&
    (!!data.step2?.federalEin || false) &&
    (!!data.step3?.hasGlInsurance || false) &&
    (data.step0?.hasEmployees ? !!data.step3?.hasWorkersComp : !!data.step3?.hasWcWaiver) &&
    (!isGeneral || data.step5?.examStatus === "passed")
  
  const form = useForm<Step6FormValues>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      doplAppCompleted: data.step6?.doplAppCompleted || false,
      reviewRequested: data.step6?.reviewRequested || false,
      doplDeliveryAck: data.step6?.doplDeliveryAck || false,
    }
  })

  const appCompleted = form.watch("doplAppCompleted") ?? false

  const onSubmit = (values: Step6FormValues) => {
    const parsed: Step6Data = step6Schema.parse(values)
    updateData("step6", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>DOPL Application Prep</CardTitle>
      </CardHeader>
      <CardContent>
        {!prereqsMet && (
          <div className="p-4 bg-slate-50 rounded-md border text-sm text-slate-700">
            Complete prior steps (education, business entity/EIN, insurance, {isGeneral ? "exam, " : ""}workers comp) before preparing the DOPL application.
          </div>
        )}
        <form id="step6-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-disabled={!prereqsMet}>
          
          {prereqsMet && (
            <>
              <div className="space-y-3">
                <Label className="text-base">Have you filled out the DOPL Contractor Application?</Label>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="yes" 
                      checked={appCompleted === true}
                      onChange={() => form.setValue("doplAppCompleted", true)}
                      className="w-4 h-4" 
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      value="no" 
                      checked={appCompleted === false}
                      onChange={() => form.setValue("doplAppCompleted", false)}
                      className="w-4 h-4" 
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {!appCompleted && (
                 <div className="p-4 bg-slate-100 rounded-md text-sm space-y-2">
                    <p>You need to complete the official application.</p>
                    <a href="https://dopl.utah.gov/wp-content/uploads/2022/01/contractor_app.pdf" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium block">Download DOPL Contractor Application PDF</a>
                 </div>
              )}

              {appCompleted && (
                 <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                    <UploadField
                      label="Upload Completed DOPL Application"
                      step={6}
                      fileType="dopl_application"
                      applicationId={applicationId}
                      accept=".pdf"
                    />
                 </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                 <div className="flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      id="ackDeliver"
                      {...form.register("doplDeliveryAck", { required: true })}
                      className="mt-1 w-4 h-4" 
                    />
                    <Label htmlFor="ackDeliver" className="text-slate-600">I understand I must mail or hand-deliver my application to DOPL (processing time 4-6 weeks).</Label>
                 </div>
                 <div className="flex items-start gap-2">
                    <input 
                       type="checkbox" 
                       id="reviewRequested"
                       {...form.register("reviewRequested")}
                       className="mt-1 w-4 h-4" 
                    />
                    <Label htmlFor="reviewRequested">I would like Integrated Contractor School to review my packet before I submit to DOPL.</Label>
                 </div>
              </div>
            </>
          )}

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step6-form" disabled={!prereqsMet}>Next Step</Button>
      </CardFooter>
    </Card>
  )
}


