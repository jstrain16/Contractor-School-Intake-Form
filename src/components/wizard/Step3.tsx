"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, Step3Data, Step3FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function Step3() {
  const { data, updateData, nextStep, prevStep } = useWizardStore()
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
                <div className="space-y-2">
                   <Label>Upload General Liability Certificate (COI)</Label>
                   <Input type="file" accept=".pdf,.jpg,.png" />
                </div>
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
                      <div className="space-y-2">
                        <Label>Upload Workers Comp Certificate</Label>
                        <Input type="file" accept=".pdf,.jpg,.png" />
                      </div>
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
                    <Label>Upload Workers Comp Waiver</Label>
                    <Input type="file" accept=".pdf,.jpg,.png" />
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

