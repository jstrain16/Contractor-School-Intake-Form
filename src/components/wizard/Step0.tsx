"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step0Schema, Step0Data, Step0FormValues } from "@/lib/schemas"
import { useWizardStore } from "@/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function Step0() {
  const { data, updateData, nextStep } = useWizardStore()
  const form = useForm<Step0FormValues>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      firstName: data.step0?.firstName || "",
      lastName: data.step0?.lastName || "",
      phone: data.step0?.phone || "",
      email: data.step0?.email || "",
      preferredContact: data.step0?.preferredContact || "email",
      hasEmployees: data.step0?.hasEmployees ?? false,
      employeeCount: data.step0?.employeeCount,
    }
  })

  const onSubmit = (values: Step0FormValues) => {
    const parsed: Step0Data = step0Schema.parse(values)
    updateData("step0", parsed)
    nextStep()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Info</CardTitle>
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

