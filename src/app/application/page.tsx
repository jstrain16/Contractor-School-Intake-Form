"use client"

import { useRouter } from "next/navigation"
import { ApplicationForm } from "@/components/V2/ApplicationForm"

export default function ApplicationPage() {
  const router = useRouter()
  return <ApplicationForm onBack={() => router.push("/dashboard")} />
}
