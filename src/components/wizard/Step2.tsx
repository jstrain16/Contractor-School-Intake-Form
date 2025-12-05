"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step2Schema, Step2Data, Step2FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { UploadField } from "@/components/wizard/UploadField"

export function Step2() {
  const { data, updateData, nextStep, prevStep, applicationId } = useWizardStore()
  const form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      hasEntityRegistered: data.step2?.hasEntityRegistered || false,
      legalBusinessName: data.step2?.legalBusinessName || "",
      entityType: data.step2?.entityType || "LLC",
      stateOfIncorporation: data.step2?.stateOfIncorporation || "Utah",
      utahEntityNumber: data.step2?.utahEntityNumber || "",
      dateRegistered: data.step2?.dateRegistered || "",
      businessPhone: data.step2?.businessPhone || "",
      businessEmail: data.step2?.businessEmail || "",
      physicalAddress: data.step2?.physicalAddress || { street: "", city: "", state: "UT", zip: "" },
      mailingAddressSame: data.step2?.mailingAddressSame ?? true,
      hasEin: data.step2?.hasEin || false,
      federalEin: data.step2?.federalEin || "",
      hasBusinessBankAccount: data.step2?.hasBusinessBankAccount || false,
    }
  })

  const hasEntity = form.watch("hasEntityRegistered")
  const mailingAddressSame = form.watch("mailingAddressSame")
  const hasEin = form.watch("hasEin")
  const hasBankAccount = form.watch("hasBusinessBankAccount")

  const onSubmit = (values: Step2FormValues) => {
    const parsed: Step2Data = step2Schema.parse(values)
    updateData("step2", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Business Entity & Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step2-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Do you already have a business entity registered?</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes"
                    checked={hasEntity === true}
                    onChange={() => form.setValue("hasEntityRegistered", true)}
                    className="w-4 h-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="no"
                    checked={hasEntity === false}
                    onChange={() => form.setValue("hasEntityRegistered", false)}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {hasEntity && (
              <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                <div className="space-y-2">
                  <Label htmlFor="legalBusinessName">Legal Business Name</Label>
                  <Input id="legalBusinessName" {...form.register("legalBusinessName")} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entityType">Business Entity Type</Label>
                    <select 
                      id="entityType" 
                      {...form.register("entityType")}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                      <option value="LLC">LLC</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
                    <Input id="stateOfIncorporation" {...form.register("stateOfIncorporation")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utahEntityNumber">Utah Entity Number (if known)</Label>
                    <Input id="utahEntityNumber" {...form.register("utahEntityNumber")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateRegistered">Date Registered</Label>
                    <Input id="dateRegistered" type="date" {...form.register("dateRegistered")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input id="businessPhone" {...form.register("businessPhone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input id="businessEmail" type="email" {...form.register("businessEmail")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Physical Address</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input placeholder="Street Address" {...form.register("physicalAddress.street")} />
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="City" {...form.register("physicalAddress.city")} />
                      <Input placeholder="State" {...form.register("physicalAddress.state")} />
                      <Input placeholder="ZIP" {...form.register("physicalAddress.zip")} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="mailingAddressSame" 
                    {...form.register("mailingAddressSame")} 
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="mailingAddressSame" className="mb-0">Mailing address is same as physical?</Label>
                </div>

                {!mailingAddressSame && (
                  <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                    <Label>Mailing Address</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Input placeholder="Street Address" {...form.register("mailingAddress.street")} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="City" {...form.register("mailingAddress.city")} />
                        <Input placeholder="State" {...form.register("mailingAddress.state")} />
                        <Input placeholder="ZIP" {...form.register("mailingAddress.zip")} />
                      </div>
                    </div>
                  </div>
                )}

                <UploadField
                  label="Proof of Registration Upload"
                  step={2}
                  fileType="registration_proof"
                  applicationId={applicationId}
                  accept=".pdf,.jpg,.png"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="hasEin" 
                {...form.register("hasEin")} 
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="hasEin" className="mb-0">Do you have your Federal EIN (FEIN)?</Label>
            </div>
            {hasEin ? (
              <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                <Label htmlFor="federalEin">Federal EIN (FEIN)</Label>
                <Input id="federalEin" {...form.register("federalEin")} />
                <div className="text-xs text-slate-500">Recommended: Upload IRS EIN confirmation letter</div>
                <UploadField
                  label="IRS EIN confirmation letter"
                  step={2}
                  fileType="ein_letter"
                  applicationId={applicationId}
                  accept=".pdf,.jpg,.png"
                />
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                You will need an EIN to complete licensing. Please obtain one to continue.
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
             <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="hasBusinessBankAccount" 
                 {...form.register("hasBusinessBankAccount")} 
                 className="w-4 h-4 rounded border-gray-300"
               />
               <Label htmlFor="hasBusinessBankAccount" className="mb-0">Do you have a business bank account?</Label>
             </div>
             
             {hasBankAccount ? (
               <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                 <UploadField
                   label="Upload Voided Check (required)"
                   step={2}
                   fileType="voided_check"
                   applicationId={applicationId}
                   accept=".pdf,.jpg,.png"
                 />
               </div>
             ) : (
               <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                 A business bank account and voided check will be required to proceed with licensing.
               </div>
             )}
          </div>

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button
          type="button"
          onClick={() => form.handleSubmit(onSubmit, () => nextStep())()}
        >
          Next Step
        </Button>
      </CardFooter>
    </Card>
  )
}

