"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step6Schema, Step6Data } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function Step6() {
  const { data, updateData, nextStep, prevStep } = useWizardStore()
  
  const form = useForm<Step6Data>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      doplAppCompleted: data.step6?.doplAppCompleted || false,
      reviewRequested: data.step6?.reviewRequested || false,
    }
  })

  const appCompleted = form.watch("doplAppCompleted")

  const onSubmit = (values: Step6Data) => {
    updateData("step6", values)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>DOPL Application Prep</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step6-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
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
                <a href="#" className="text-blue-600 underline font-medium block">Download DOPL Contractor Application PDF</a>
             </div>
          )}

          {appCompleted && (
             <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                <Label>Upload Completed DOPL Application</Label>
                <Input type="file" accept=".pdf" />
             </div>
          )}

          <div className="space-y-3 pt-4 border-t">
             <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 w-4 h-4" defaultChecked disabled />
                <Label className="text-slate-600">I understand I must mail or hand-deliver my application to DOPL (processing time 4-6 weeks).</Label>
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

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step6-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}


