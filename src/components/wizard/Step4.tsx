"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step4Schema, Step4Data, Step4FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function Step4() {
  const { data, updateData, nextStep, prevStep } = useWizardStore()
  const hasEmployees = data.step0?.hasEmployees

  const form = useForm<Step4FormValues>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      qualifierDob: data.step4?.qualifierDob || "",
      
      hasExperience: data.step4?.hasExperience || false,
      totalYearsExperience: data.step4?.totalYearsExperience || 0,
      primaryTrade: data.step4?.primaryTrade || "",
      experienceEntries: data.step4?.experienceEntries || [],
      hasEmployeeWorkersComp: data.step4?.hasEmployeeWorkersComp || false,
      wantsInsuranceQuote: data.step4?.wantsInsuranceQuote || false,
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experienceEntries"
  })

  const hasExperience = form.watch("hasExperience")
  const employeeWc = form.watch("hasEmployeeWorkersComp")

  const onSubmit = (values: Step4FormValues) => {
    const parsed: Step4Data = step4Schema.parse(values)
    updateData("step4", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Experience & Qualifier Info</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step4-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {hasEmployees && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Workers Compensation (Employees)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasEmployeeWorkersComp"
                  {...form.register("hasEmployeeWorkersComp")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="hasEmployeeWorkersComp" className="mb-0">Do you have Workers Compensation Insurance?</Label>
              </div>
              {employeeWc ? (
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                  <Label>Upload Workers Comp Certificate</Label>
                  <Input type="file" accept=".pdf,.jpg,.png" />
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-md border space-y-2">
                  <p className="text-sm">Would you like Integrated Insurance Solutions to contact you with a quote?</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...form.register("wantsInsuranceQuote")}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span>Yes, please have Integrated Insurance Solutions reach out.</span>
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Work Experience</h3>
            <div className="space-y-2">
              <Label htmlFor="qualifierDob">Date of Birth</Label>
              <Input id="qualifierDob" type="date" {...form.register("qualifierDob")} />
              {form.formState.errors.qualifierDob && <p className="text-red-500 text-sm">{form.formState.errors.qualifierDob.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hasExperience" 
                  {...form.register("hasExperience")} 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="hasExperience" className="mb-0">Do you have at least 2 years / 4,000 hours of paid construction work experience?</Label>
              </div>
            </div>

            {hasExperience && (
              <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalYearsExperience">Total Years Experience</Label>
                    <Input id="totalYearsExperience" type="number" {...form.register("totalYearsExperience", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryTrade">Primary Trade / Role</Label>
                    <Input id="primaryTrade" {...form.register("primaryTrade")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Experience Breakdown</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md bg-slate-50 space-y-3 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Employer / Company</Label>
                          <Input {...form.register(`experienceEntries.${index}.employer`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input {...form.register(`experienceEntries.${index}.jobTitle`)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" {...form.register(`experienceEntries.${index}.startDate`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input type="date" {...form.register(`experienceEntries.${index}.endDate`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Hours/Week</Label>
                          <Input type="number" {...form.register(`experienceEntries.${index}.hoursPerWeek`, { valueAsNumber: true })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Responsibilities Description</Label>
                        <textarea 
                          className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                          rows={3}
                          {...form.register(`experienceEntries.${index}.responsibilities`)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => append({ employer: "", jobTitle: "", startDate: "", endDate: "", hoursPerWeek: 40, responsibilities: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Experience Entry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step4-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}

