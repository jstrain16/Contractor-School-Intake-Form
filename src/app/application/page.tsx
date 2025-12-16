"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ApplicationForm } from "@/components/V2/ApplicationForm"

export default function ApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phaseParam = searchParams?.get("phase")
  const initialPhase = phaseParam ? Number(phaseParam) : undefined
  return <ApplicationForm initialPhase={initialPhase} onBack={() => router.push("/dashboard")} />
}
