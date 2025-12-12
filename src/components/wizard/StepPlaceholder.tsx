"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWizardStore } from "@/store/wizard-store"

type Props = {
  title: string
  description?: string
}

export function StepPlaceholder({ title, description }: Props) {
  const { prevStep, nextStep } = useWizardStore()
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <p>{description || "This step will be implemented with full form fields and uploads. Continue for now."}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Previous</Button>
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  )
}

