"use client"

import { useEffect, useState } from "react"
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

export function Step0() {
  const { data, updateData, nextStep } = useWizardStore()
  const [specialtyError, setSpecialtyError] = useState<string | null>(null)
  const form = useForm<Step0FormValues>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      firstName: data.step0?.firstName || "",
      lastName: data.step0?.lastName || "",
      phone: data.step0?.phone || "",
      email: data.step0?.email || "",
      preferredContact: data.step0?.preferredContact || "email",
      licenseType: data.step0?.licenseType,
      generalLicenses: data.step0?.generalLicenses || [],
      specialtyLicenses: data.step0?.specialtyLicenses || [],
      trade: data.step0?.trade || "",
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
      // if trade is blank, derive from the first selected license
      trade:
        values.trade ||
        values.generalLicenses?.[0] ||
        values.specialtyLicenses?.[0] ||
        "",
    })
    updateData("step0", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account & License Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="step0-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="(555) 555-5555" />
              {form.formState.errors.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" />
              {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method</Label>
            <select 
              id="preferredContact" 
              {...form.register("preferredContact")}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text</option>
            </select>
          </div>

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

          <div className="space-y-2">
            <Label className="text-base">Will you have employees?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="yes"
                  checked={form.watch("hasEmployees") === true}
                  onChange={() => form.setValue("hasEmployees", true)}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="no"
                  checked={form.watch("hasEmployees") === false}
                  onChange={() => {
                    form.setValue("hasEmployees", false)
                    form.setValue("employeeCount", undefined)
                  }}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
            {form.watch("hasEmployees") && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="employeeCount">If yes, how many employees?</Label>
                <select
                  id="employeeCount"
                  {...form.register("employeeCount", { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <option value="">Select a range</option>
                  <option value={1}>1-4</option>
                  <option value={5}>5-9</option>
                  <option value={10}>10-24</option>
                  <option value={25}>25-49</option>
                  <option value={50}>50+</option>
                </select>
              </div>
            )}
          </div>

        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" form="step0-form">Next Step</Button>
      </CardFooter>
    </Card>
  )
}

