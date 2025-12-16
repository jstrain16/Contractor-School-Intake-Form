"use client"

import * as React from "react"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  GraduationCap,
  HelpCircle,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SectionStatus = "complete" | "pending" | "not_started"

export type DashboardSection = {
  id: string
  label: string
  status: SectionStatus
  progress?: number
  icon?: React.ReactNode
  description?: string
  href?: string
  onClick?: () => void
}

export type DashboardStat = {
  id: string
  title: string
  value: React.ReactNode
  description?: string
}

export type DashboardLayoutProps = {
  title?: string
  subtitle?: string
  overall: {
    percent: number
    nextUp?: string
    label?: string
  }
  sections: DashboardSection[]
  primaryCta?: {
    label: string
    href?: string
    onClick?: () => void
  }
  continueCta?: {
    label: string
    href?: string
    onClick?: () => void
  }
  stats?: DashboardStat[]
  showHelpButton?: boolean
  onHelpClick?: () => void
  headerLabel?: string
  userIcon?: React.ReactNode
}

const statusPillStyles: Record<SectionStatus, string> = {
  complete: "bg-green-50 text-green-700",
  pending: "bg-orange-50 text-orange-700",
  not_started: "bg-slate-100 text-slate-600",
}

const statusBarStyles: Record<SectionStatus, string> = {
  complete: "bg-[#00a63e]",
  pending: "bg-[#f54900]",
  not_started: "bg-slate-300",
}

const statusIcon = (status: SectionStatus) => {
  if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-[#00a63e]" aria-hidden />
  if (status === "pending") return <Circle className="h-4 w-4 text-[#f54900]" aria-hidden />
  return <Circle className="h-4 w-4 text-slate-300" aria-hidden />
}

function SectionCard({ section }: { section: DashboardSection }) {
  const progress =
    section.progress ??
    (section.status === "complete" ? 100 : section.status === "pending" ? 45 : 0)

  const content = (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[#f54900]/50 hover:shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-slate-900">
          {section.icon ?? statusIcon(section.status)}
          <span className="text-sm font-semibold leading-5">{section.label}</span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold leading-4",
            statusPillStyles[section.status]
          )}
        >
          {section.status === "complete" ? "Complete" : section.status === "pending" ? "Pending" : "Not started"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`${section.label} progress`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", statusBarStyles[section.status])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )

  if (section.href) {
    return (
      <a href={section.href} onClick={section.onClick} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f54900] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
        {content}
      </a>
    )
  }

  if (section.onClick) {
    return (
      <button
        type="button"
        onClick={section.onClick}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f54900] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {content}
      </button>
    )
  }

  return content
}

export function DashboardLayout({
  title = "Contractor School",
  subtitle = "Track your licensing intake, progress, and documents in one place.",
  overall,
  sections,
  primaryCta,
  continueCta,
  stats = [],
  showHelpButton = true,
  onHelpClick,
  headerLabel = "Dashboard",
  userIcon,
}: DashboardLayoutProps) {
  const overallPct = Math.min(100, Math.max(0, overall.percent))

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2 text-slate-600">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-700">{headerLabel}</span>
          <div className="flex items-center justify-center rounded-full bg-[#155dfc] text-white h-10 w-10">
            {userIcon ?? <UserRound className="h-5 w-5" aria-hidden />}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 md:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <GraduationCap className="h-6 w-6 text-slate-800" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-7 text-slate-900">{title}</h1>
                <p className="text-base text-slate-600">{subtitle}</p>
              </div>
            </div>
            {primaryCta && primaryCta.href && (
              <a
                href={primaryCta.href}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#f54900] px-5 text-base font-medium text-white shadow-sm transition hover:bg-[#d64000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f54900] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            )}
            {primaryCta && !primaryCta.href && (
              <Button
                onClick={primaryCta.onClick}
                className="h-11 rounded-lg bg-[#f54900] px-5 text-base font-medium text-white shadow-sm hover:bg-[#d64000] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f54900]"
              >
                <span className="inline-flex items-center gap-2">
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-start justify-between gap-3 text-sm font-medium uppercase tracking-wide text-slate-700 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#101828] text-white">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="leading-none">
                  <p className="text-[11px] tracking-[0.3px] text-slate-400">Overall Progress</p>
                  <p className="text-base font-semibold normal-case text-slate-900">{overallPct}% complete</p>
                </div>
              </div>
              {overall.nextUp && (
                <div className="text-sm font-medium text-slate-500">
                  Next up: <span className="text-slate-800">{overall.nextUp}</span>
                </div>
              )}
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={overallPct}
              aria-label={overall.label || "Overall progress"}
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
            >
              <div
                className="h-full rounded-full bg-[#030213]"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </section>

        {continueCta && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            {continueCta.href ? (
              <a
                href={continueCta.href}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#f54900] px-6 text-base font-medium text-white shadow-sm transition hover:bg-[#d64000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f54900] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {continueCta.label}
              </a>
            ) : (
              <Button
                onClick={continueCta.onClick}
                className="h-12 rounded-lg bg-[#f54900] px-6 text-base font-medium text-white shadow-sm hover:bg-[#d64000] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f54900]"
              >
                <span className="inline-flex items-center gap-2">
                  {continueCta.label}
                </span>
              </Button>
            )}
          </div>
        )}

        {stats.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.id} className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-slate-500">
                  {stat.title}
                </p>
                <div className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</div>
                {stat.description && (
                  <p className="mt-1 text-sm text-slate-600">{stat.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {showHelpButton && (
        <button
          type="button"
          onClick={onHelpClick}
          aria-label="Help"
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#f54900] text-white shadow-lg transition hover:bg-[#d64000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f54900] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <HelpCircle className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  )
}


