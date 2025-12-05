"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step1Schema, Step1Data, Step1FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function Step1() {
  const { data, updateData, nextStep, prevStep } = useWizardStore()
  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      preLicensureCompleted: data.step1?.preLicensureCompleted || false,
      courseProvider: data.step1?.courseProvider || "",
      dateCompleted: data.step1?.dateCompleted || "",
      certificateNumber: data.step1?.certificateNumber || "",
      exemptions: data.step1?.exemptions || [],
    }
  })

  const completed = form.watch("preLicensureCompleted") ?? false
  const exemptions = form.watch("exemptions") ?? []

  const onSubmit = (values: Step1FormValues) => {
    const parsed: Step1Data = step1Schema.parse(values)
    updateData("step1", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pre-Licensure Course / Education</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step1-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-3">
            <Label className="text-base">Have you completed the 25-hour Prelicensure Course?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="yes" 
                  checked={completed === true}
                  onChange={() => form.setValue("preLicensureCompleted", true)}
                  className="w-4 h-4" 
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="no" 
                  checked={completed === false}
                  onChange={() => form.setValue("preLicensureCompleted", false)}
                  className="w-4 h-4" 
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {!completed && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
              You need to complete the course. <a href="https://utahhba.com" target="_blank" rel="noreferrer" className="underline font-medium">Click here to schedule the 25 Hour Pre-license Course</a>.
            </div>
          )}

          {completed && (
            <div className="space-y-4 border-l-2 border-slate-200 pl-4">
              <div className="space-y-2">
                <Label htmlFor="courseProvider">Course Provider Name</Label>
                <Input id="courseProvider" {...form.register("courseProvider")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateCompleted">Date Completed</Label>
                  <Input id="dateCompleted" type="date" {...form.register("dateCompleted")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number (Optional)</Label>
                  <Input id="certificateNumber" {...form.register("certificateNumber")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload Prelicensure Certificate</Label>
                <Input type="file" accept=".pdf,.jpg,.png" />
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base">Exemptions (Do you meet an exemption?)</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  value="degree" 
                  {...form.register("exemptions")}
                  className="w-4 h-4 rounded border-gray-300" 
                />
                <span>Accredited construction management degree (2 or 4-year)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  value="pe_license" 
                  {...form.register("exemptions")}
                  className="w-4 h-4 rounded border-gray-300" 
                />
                <span>Active, unrestricted Utah professional engineer license</span>
              </label>
            </div>

            {exemptions?.includes("degree") && (
               <div className="space-y-2 pl-6">
                 <Label>Upload Degree Diploma / Transcript</Label>
                 <Input type="file" accept=".pdf,.jpg,.png" />
               </div>
            )}
            {exemptions?.includes("pe_license") && (
               <div className="space-y-2 pl-6">
                 <Label>Upload PE License Documentation</Label>
                 <Input type="file" accept=".pdf,.jpg,.png" />
               </div>
            )}
          </div>

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step1-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}


