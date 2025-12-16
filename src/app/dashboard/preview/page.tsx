"use client"

import { DashboardLayout, DashboardSection, DashboardStat } from "@/components/dashboard"

const sampleSections: DashboardSection[] = [
  { id: "account", label: "Account Setup", status: "complete" },
  { id: "entity", label: "Business Entity, FEIN & Banking", status: "complete" },
  { id: "workers-comp", label: "Workers Compensation", status: "pending", progress: 50 },
  { id: "business-law", label: "Business & Law Exam", status: "complete" },
  { id: "education", label: "Pre-Licensure / Education", status: "pending", progress: 35 },
  { id: "liability", label: "General Liability", status: "pending", progress: 35 },
  { id: "experience", label: "Experience / Qualifier", status: "complete" },
  { id: "dcpl", label: "DCPL Application", status: "pending", progress: 35 },
]

const sampleStats: DashboardStat[] = [
  { id: "progress", title: "Progress", value: "52%", description: "Weighted completion across all sections" },
  { id: "next", title: "Next Action", value: "Workers Compensation", description: "Complete the next section to move forward." },
]

export default function DashboardPreviewPage() {
  return (
    <DashboardLayout
      overall={{ percent: 52, nextUp: "Workers Compensation", label: "Overall progress" }}
      sections={sampleSections}
      primaryCta={{ label: "Go to Application", href: "/application" }}
      continueCta={{ label: "Continue Application", href: "/application" }}
      stats={sampleStats}
      onHelpClick={() => {
        // placeholder for help action
      }}
    />
  )
}


