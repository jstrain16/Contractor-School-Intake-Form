"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step5Schema, Step5Data, Step5FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { UploadField } from "@/components/wizard/UploadField"

export function Step5() {
  const { data, updateData, nextStep, prevStep, applicationId } = useWizardStore()
  const isGeneral = (data.step0?.generalLicenses?.length ?? 0) > 0 || data.step0?.licenseType === "general"
  // Only General Contractors need this exam usually, but prompt says "General Contractors must pass...". 
  // It doesn't explicitly say Specialty don't need it, but implies it. 
  // "For General Contractors there are extra requirements... Prov Business & Law exam."
  // I'll show a note if Specialty, or just let them fill it out if they want/need.
  // I'll assume it's required for General, optional/hidden for Specialty?
  // The Prompt Step 5 says: "From HBA: General Contractors must pass..."
  // I'll stick to showing it for everyone but maybe marking it as required only for General in schema? 
  // Current schema makes it optional effectively by defaults. I'll just show it.

  const form = useForm<Step5FormValues>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      examStatus: data.step5?.examStatus || "not_scheduled",
      examDate: data.step5?.examDate || "",
      examLocation: data.step5?.examLocation || "",
      examPassedDate: data.step5?.examPassedDate || "",
      examId: data.step5?.examId || "",
      planToTakeExam: data.step5?.planToTakeExam ?? isGeneral,
    }
  })

  const examStatus = form.watch("examStatus") ?? "not_scheduled"
  const planToTakeExam = form.watch("planToTakeExam") ?? isGeneral

  const onSubmit = (values: Step5FormValues) => {
    const parsed: Step5Data = step5Schema.parse(values)
    updateData("step5", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Exams & Testing (Prov Business & Law)</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step5-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {!isGeneral && (
            <div className="p-4 bg-slate-50 rounded-md border text-sm text-slate-700">
              Business & Law exam is typically not required for specialty-only licenses. If you still plan to take it, you can record the details below.
              <div className="mt-3 space-y-2">
                <Label className="text-sm">Do you still plan on taking the Business & Law exam?</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="yes"
                      checked={planToTakeExam === true}
                      onChange={() => form.setValue("planToTakeExam", true)}
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="no"
                      checked={planToTakeExam === false}
                      onChange={() => {
                        form.setValue("planToTakeExam", false)
                        form.setValue("examStatus", "not_scheduled")
                        form.setValue("examDate", "")
                        form.setValue("examLocation", "")
                        form.setValue("examPassedDate", "")
                        form.setValue("examId", "")
                      }}
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {planToTakeExam && (
          <div className="space-y-3">
            <Label className="text-base">Have you scheduled the Prov Business & Law Exam?</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="not_scheduled" 
                  {...form.register("examStatus")}
                  className="w-4 h-4" 
                />
                <span>No, I need to schedule it</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="scheduled" 
                  {...form.register("examStatus")}
                  className="w-4 h-4" 
                />
                <span>Yes, it is scheduled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value="passed" 
                  {...form.register("examStatus")}
                  className="w-4 h-4" 
                />
                <span>I have already passed</span>
              </label>
            </div>
          </div>
          )}

          {planToTakeExam && examStatus === "not_scheduled" && (
             <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
               You need to pass the Utah Business and Law Exam.{" "}
               <a
                 href="https://commerce.utah.gov/dopl/licensing-exams/schedule-an-exam-2/"
                 className="underline font-medium"
                 target="_blank"
                 rel="noreferrer"
               >
                 Click here to schedule with Prov
               </a>
               .
             </div>
          )}

          {planToTakeExam && examStatus === "scheduled" && (
             <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="examDate">Exam Date</Label>
                      <Input id="examDate" type="date" {...form.register("examDate")} />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="examLocation">Location</Label>
                      <Input id="examLocation" {...form.register("examLocation")} />
                   </div>
                </div>
             </div>
          )}

          {planToTakeExam && examStatus === "passed" && (
             <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="examPassedDate">Date Passed</Label>
                      <Input id="examPassedDate" type="date" {...form.register("examPassedDate")} />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="examId">Candidate / Exam ID</Label>
                      <Input id="examId" {...form.register("examId")} />
                   </div>
                </div>
                <UploadField
                  label="Upload Score Report"
                  step={5}
                  fileType="exam_score_report"
                  applicationId={applicationId}
                  accept=".pdf,.jpg,.png"
                />
             </div>
          )}

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step5-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}


