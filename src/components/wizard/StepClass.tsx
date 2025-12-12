"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWizardStore } from "@/store/wizard-store"

export function StepClass() {
  const { prevStep, nextStep } = useWizardStore()

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Class Selection &amp; Enrollment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p>Class schedule selection will be integrated here (WooCommerce feed of dates, seats, pricing, location).</p>
        <p>After purchase, status will be set to “Class Booked.”</p>
        <p>For now, continue to the screening step.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  )
}

