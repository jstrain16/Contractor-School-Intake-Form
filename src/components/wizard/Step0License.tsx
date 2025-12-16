"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step0Schema, Step0Data, Step0FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

const generalLicenses = [
  "B100 – General Building Contractor",
  "B200 – Modular Unit Installation Contractor",
  "E100 – General Engineering Contractor",
  "E200 – General Electrical Contractor (Must be Master Electrician)",
  "P200 – General Plumbing Contractor (Must be Master Plumber)",
  "R100 – Residential/Small Commercial, General Contractor (20k sq ft/3 stories)",
  "R200 – Factory-Built Housing Contractor (Manufactured Housing)",
  "S700 – Limited Scope License Contractor",
]

const specialtyLicenses = [
  "E201 – Residential Electrical Contractor (Must be Residential Master Electrician)",
  "P201 – Residential Plumbing Contractor (Must be a Master Plumber)",
  "R101 – Residential/Small Commercial, Non-Structural Remodel & Repair (50k sq ft/existing structure)",
  "S202 – Solar Photovoltaic Contractor (Requires NABCEP Certificate)",
  "S220 – Carpentry & Flooring Contractor (Mechanical Insulation)",
  "S230 – Masonry, Siding, Stucco, Glass, & Rain Gutter Contractor",
  "S260 – Asphalt & Concrete Contractor",
  "S270 – Drywall, Paint, Plaster, & Insulation Contractor",
  "S280 – Roofing Contractor",
  "S310 – Foundation, Excavation, & Demolition Contractor",
  "S330 – Landscape & Recreation Contractor",
  "S350 – HVAC Contractor",
  "S354 – Radon Mitigation (Must have NEHA Certification)",
  "S370 – Fire Suppression Systems Contractor",
  "S410 – Boiler, Pipeline, Waste Water, & Water Conditioner Contractor",
  "S440 – Sign Installation Contractor",
  "S510 – Elevator Contractor (Must be a Licensed Elevator Mechanic)",
]

export function Step0License() {
  const { data, updateData, nextStep, prevStep } = useWizardStore()
  const [specialtyError, setSpecialtyError] = useState<string | null>(null)
  const form = useForm<Step0FormValues>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      generalLicenses: data.step0?.generalLicenses || [],
      specialtyLicenses: data.step0?.specialtyLicenses || [],
      trade: data.step0?.trade || "",
      // preserve other fields so parse works
      firstName: data.step0?.firstName || "",
      lastName: data.step0?.lastName || "",
      phone: data.step0?.phone || "",
      email: data.step0?.email || "",
      preferredContact: data.step0?.preferredContact || "email",
      hasEmployees: data.step0?.hasEmployees ?? false,
      employeeCount: data.step0?.employeeCount,
    }
  })

  const handleSpecialtyToggle = (license: string) => {
    const current = form.getValues("specialtyLicenses") || []
    if (current.includes(license)) {
      form.setValue(
        "specialtyLicenses",
        current.filter((l) => l !== license)
      )
      return
    }
    if (current.length >= 3) {
      setSpecialtyError("You can only select up to 3 specialty licenses.")
      setTimeout(() => setSpecialtyError(null), 2000)
      return
    }
    form.setValue("specialtyLicenses", [...current, license])
  }

  const handleGeneralToggle = (license: string) => {
    const current = form.getValues("generalLicenses") || []
    if (current.includes(license)) {
      form.setValue(
        "generalLicenses",
        current.filter((l) => l !== license)
      )
      return
    }
    form.setValue("generalLicenses", [...current, license])
  }

  const onSubmit = (values: Step0FormValues) => {
    const licenseType = (values.generalLicenses?.length ?? 0) > 0 ? "general" : "specialty"
    const parsed: Step0Data = step0Schema.parse({
      ...values,
      licenseType,
      trade: values.trade || values.generalLicenses?.[0] || values.specialtyLicenses?.[0] || "",
    })
    updateData("step0", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>License Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step0-license-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">License Types (choose all that apply)</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">General Contractor Licenses</span>
                  <span className="text-xs text-slate-500">Selecting any of these will require the Business & Law exam.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {generalLicenses.map((opt) => {
                    const selected = (form.watch("generalLicenses") || []).includes(opt)
                    return (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleGeneralToggle(opt)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Specialty Licenses (up to 3)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {specialtyLicenses.map((opt) => {
                    const selected = (form.watch("specialtyLicenses") || []).includes(opt)
                    return (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleSpecialtyToggle(opt)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
                {specialtyError && <p className="text-red-500 text-sm">{specialtyError}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade">Planned Trade / Notes (optional)</Label>
            <Input id="trade" {...form.register("trade")} placeholder="e.g., Primary focus or notes" />
            {form.formState.errors.trade && <p className="text-red-500 text-sm">{form.formState.errors.trade.message}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button type="submit" form="step0-license-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}











