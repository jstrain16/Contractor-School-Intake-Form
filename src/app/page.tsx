"use client"

import Link from "next/link"
import { Activity, FileText, RouteIcon, ShieldCheck, GraduationCap, Building2, FileCheck2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const navItems = [
  { label: "Portal Features", href: "#features" },
  { label: "Requirements", href: "#requirements" },
  { label: "Support", href: "#support" },
  { label: "FAQs", href: "#faqs" },
]

const features = [
  {
    icon: Activity,
    title: "Real-Time Progress Tracking",
    body: "Monitor your completion status across all 8 required steps without missing a deadline.",
  },
  {
    icon: FileText,
    title: "Document Management",
    body: "Upload and store all required documents securely. Keep everything organized in one place.",
  },
  {
    icon: RouteIcon,
    title: "Guided Workflow",
    body: "Step-by-step guidance through each requirement so you always know what’s next.",
  },
]

const steps = [
  { label: "Account Setup", status: "Complete", icon: ShieldCheck },
  { label: "Business Entity / FEIN & Banking", status: "Complete", icon: Building2 },
  { label: "Workers Compensation", status: "Pending", icon: ShieldCheck },
  { label: "Business & Law Exam", status: "Complete", icon: FileCheck2 },
  { label: "Pre-Licensure / Education", status: "Pending", icon: GraduationCap },
  { label: "General Liability", status: "Pending", icon: ShieldCheck },
  { label: "Experience / Qualifier", status: "Complete", icon: MessageSquare },
  { label: "DOPL Application", status: "Pending", icon: FileText },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top strip */}
      <div className="w-full border-b border-[#0c5dcc]/20 bg-[#0b64d0] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">✉️</span>
              <span className="font-semibold">info@bascontractor.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">📞</span>
              <span className="font-semibold">801-467-1800</span>
            </div>
          </div>
          <div className="text-sm font-semibold">Need Help? Chat with us</div>
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-400/60 bg-orange-500 text-white shadow-sm">
              <span className="text-lg font-semibold">CS</span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">CONTRACTORS SCHOOL</div>
              <div className="text-xs text-slate-600">Licensing Portal</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-800 md:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-slate-500">
                {item.label}
              </Link>
            ))}
            <Link href="/sign-in" className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-sm shadow-orange-400/40 hover:bg-orange-600">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12">
        <section className="grid gap-12 rounded-3xl border border-[#dbe9ff] bg-gradient-to-b from-[#f3f7ff] via-[#e6f1ff] to-[#f8fbff] p-6 md:grid-cols-2 md:items-center md:p-10">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0c5dcc] shadow-sm">
              Your Licensing Journey, Simplified
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                Track Your
                <span className="block text-slate-900">Licensing Progress</span>
                <span className="block text-slate-900">All in One Place</span>
              </h1>
            </div>
            <p className="text-lg text-slate-700">
              Access your personalized dashboard to manage your licensing intake, monitor progress, and complete all requirements seamlessly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/application">
                <Button size="lg" className="bg-orange-500 text-white shadow-sm shadow-orange-400/40 hover:bg-orange-600">
                  Access Your Dashboard
                </Button>
              </Link>
              <Link href="/application">
                <Button size="lg" variant="outline" className="border-[#0c5dcc] text-[#0c5dcc] hover:bg-[#0c5dcc]/10">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-slate-900">8</div>
                <div className="text-sm text-slate-600">Required Steps</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600">Digital Process</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600">Portal Access</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#dbe9ff] bg-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1600&q=80"
                alt="Dashboard preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -left-6 -bottom-6 flex items-center gap-3 rounded-xl border border-[#dbe9ff] bg-white px-4 py-3 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c5dcc] text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Your Progress</div>
                <div className="text-xs text-slate-600">52% Complete</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-24 space-y-10 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Portal Features</p>
            <h2 className="text-3xl font-bold text-slate-900">Everything you need in your licensing dashboard</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-[#dbe9ff] p-6 text-left shadow-sm">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#e9f2ff] text-[#0c5dcc]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements / Steps */}
        <section id="requirements" className="mt-24 space-y-10 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">8 Steps to Your License</p>
            <h2 className="text-3xl font-bold text-slate-900">Track your progress through each requirement</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.label} className="flex items-center justify-between border border-[#dbe9ff] px-4 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f2ff] text-[#0c5dcc]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold text-slate-900">{step.label}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    step.status === "Complete"
                      ? "bg-green-50 text-green-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {step.status}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="support" className="mt-24">
          <div className="rounded-2xl border border-[#1b46d8] bg-gradient-to-r from-[#1b46d8] via-[#234ee4] to-[#0a62e0] px-6 py-12 text-center text-white shadow-lg md:px-16">
            <h3 className="text-3xl font-bold">Ready to Get Started?</h3>
            <p className="mt-3 text-lg text-white/90">
              Access your personalized dashboard and complete your licensing requirements at your own pace.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/application">
                <Button size="lg" className="bg-white text-[#0c5dcc] hover:bg-slate-100">
                  Sign In to Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="faqs" className="border-t border-slate-200 bg-[#0f1521] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">CS</div>
                <div>
                  <div className="text-sm font-bold">CONTRACTORS SCHOOL</div>
                  <div className="text-xs text-white/70">Licensing Portal</div>
                </div>
              </div>
              <p className="text-sm text-white/80">Building Utah&apos;s future, one contractor at a time.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Contractor Licensing</li>
                <li>Continuing Education</li>
                <li>Business Formation</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>About Us</li>
                <li>Contact</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>801-467-1800</li>
                <li>info@bascontractor.com</li>
                <li>Servicio en Español disponible</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-white/60">
            © 2026 Contractors School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
