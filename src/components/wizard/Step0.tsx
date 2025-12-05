"use client"

import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step0Schema, Step0Data } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"

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
  const { isLoaded, user } = useUser()
  const { data, updateData, nextStep } = useWizardStore()
  const form = useForm<Step0Data>({
    resolver: zodResolver(step0Schema) as Resolver<Step0Data>,
    defaultValues: {
      firstName: data.step0?.firstName || "",
      lastName: data.step0?.lastName || "",
      phone: data.step0?.phone || "",
      email: data.step0?.email || "",
      preferredContact: data.step0?.preferredContact || "email",
      licenseType: data.step0?.licenseType || "specialty",
      trade: data.step0?.trade || "",
      hasEmployees: data.step0?.hasEmployees ?? false,
      employeeCount: data.step0?.employeeCount,
    }
  })

  // Prefill email/phone from Clerk once loaded (respect existing user edits)
  useEffect(() => {
    if (!isLoaded || !user) return
    if (!form.getValues("email")) {
      const email = user.primaryEmailAddress?.emailAddress
      if (email) form.setValue("email", email)
    }
    if (!form.getValues("phone")) {
      const phone = user.primaryPhoneNumber?.phoneNumber
      if (phone) form.setValue("phone", phone)
    }
  }, [isLoaded, user, form])

  const onSubmit = (values: Step0Data) => {
    updateData("step0", values)
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
            <Label className="text-base">License Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="specialty" {...form.register("licenseType")} className="w-4 h-4" />
                <span>Specialty Contractor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="general" {...form.register("licenseType")} className="w-4 h-4" />
                <span>General Contractor</span>
              </label>
            </div>
            {form.formState.errors.licenseType && <p className="text-red-500 text-sm">{form.formState.errors.licenseType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade">Planned Trade / Classification</Label>
            {form.watch("licenseType") ? (
              <select
                id="trade"
                {...form.register("trade")}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                {form.watch("licenseType") === "general"
                  ? generalLicenses.map((opt) => <option key={opt} value={opt}>{opt}</option>)
                  : specialtyLicenses.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <Input id="trade" {...form.register("trade")} placeholder="Select a license type first" readOnly />
            )}
            {form.formState.errors.trade && <p className="text-red-500 text-sm">{form.formState.errors.trade.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hasEmployees" {...form.register("hasEmployees")} className="w-4 h-4 rounded border-gray-300" />
              <Label htmlFor="hasEmployees" className="mb-0">Will you have employees?</Label>
            </div>
            {form.watch("hasEmployees") && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="employeeCount">If yes, how many?</Label>
                <Input id="employeeCount" type="number" min={1} {...form.register("employeeCount", { valueAsNumber: true })} />
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

