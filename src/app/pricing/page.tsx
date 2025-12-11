"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const plans = [
  {
    name: "Review & Send",
    price: "$149",
    badge: null,
    description: "Perfect for those who've done the prep work",
    cta: "Get Started",
    gradient: "from-slate-900 to-slate-900",
    textClass: "text-slate-900",
    buttonClass: "bg-slate-900 text-white hover:bg-slate-800",
    includes: [
      "Expert review of your completed application",
      "Document verification and formatting",
      "Professional submission to DOPL",
      "Email support during review process",
      "2-3 business day turnaround",
    ],
    muted: [
      "Workers comp assistance",
      "Document preparation",
      "Dedicated account manager",
    ],
  },
  {
    name: "Review & Workers Comp",
    price: "$299",
    badge: "Most Popular",
    description: "We handle the tricky insurance part",
    cta: "Get Started",
    gradient: "from-orange-500 to-orange-600",
    textClass: "text-orange-600",
    buttonClass: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow",
    includes: [
      "Workers compensation waiver secured",
      "Insurance documentation assistance",
      "General liability verification",
      "Priority email support",
      "1-2 business day turnaround",
      "Follow-up with DOPL if needed",
    ],
    base: [
      "Expert application review",
      "Professional DOPL submission",
      "Insurance assistance",
      "Document gathering service",
      "Business entity guidance",
      "Dedicated account manager",
    ],
  },
  {
    name: "We Do It All",
    price: "$799",
    badge: "White Glove Service",
    description: "Sit back while we handle everything",
    cta: "Get Started",
    gradient: "from-amber-400 to-amber-500",
    textClass: "text-white",
    buttonClass: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-400 shadow",
    includes: [
      "Complete application preparation",
      "All document gathering and organization",
      "Business entity guidance and FEIN assistance",
      "Insurance procurement assistance",
      "Dedicated account manager",
      "Phone & email support throughout process",
      "Priority processing (24-48 hours)",
      "Money-back guarantee if not approved",
    ],
    base: [
      "Everything in Review & Workers Comp",
    ],
  },
]

const featureTable = [
  { label: "Expert Application Review", values: ["✔", "✔", "✔"] },
  { label: "Professional DOPL Submission", values: ["✔", "✔", "✔"] },
  { label: "Workers Comp Waiver", values: ["—", "✔", "✔"] },
  { label: "Insurance Assistance", values: ["—", "✔", "✔"] },
  { label: "Complete Application Preparation", values: ["—", "—", "✔"] },
  { label: "Document Gathering Service", values: ["—", "—", "✔"] },
  { label: "Business Entity Guidance", values: ["—", "—", "✔"] },
  { label: "Dedicated Account Manager", values: ["—", "—", "✔"] },
  { label: "Turnaround Time", values: ["2-3 days", "1-2 days", "24-48 hrs"] },
  { label: "Price", values: ["$149", "$299", "$799"] },
]

const faqs = [
  {
    q: "How long does the licensing process take?",
    a: "While processing times vary by service tier, DOPL typically reviews applications within 2-4 weeks after submission. Our services ensure your application is complete and accurate, reducing delays.",
  },
  {
    q: "What if my application is rejected?",
    a: 'With our "We Do It All" package, we offer a money-back guarantee. For all tiers, we will work with you to address any issues and resubmit at no additional cost.',
  },
  {
    q: "Do I still need to complete the licensing course?",
    a: "Yes, completing the pre-licensure education course is required by Utah law. Our services help with the application process after you've completed your education.",
  },
  {
    q: "Can I upgrade my service package later?",
    a: "Absolutely! You can upgrade to a higher tier at any time. We'll credit what you've already paid toward the upgraded service.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-400/60 bg-orange-500 text-white shadow-sm">
              <span className="text-lg font-semibold">CS</span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">CONTRACTORS SCHOOL</div>
              <div className="text-xs text-slate-600">Application Services</div>
            </div>
          </Link>
          <div className="hidden items-center gap-3 text-sm font-semibold text-slate-800 md:flex">
            <Link href="/" className="hover:text-slate-500">Home</Link>
            <Link href="/pricing" className="text-orange-600">Pricing</Link>
            <Link href="/application" className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-sm shadow-orange-400/40 hover:bg-orange-600">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-white" />
            Professional Application Services
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
            Focus on Your Business,
            <br />
            We&apos;ll Handle Your License
          </h1>
          <p className="mt-4 text-lg text-orange-50/90">
            Getting licensed shouldn&apos;t be overwhelming. Choose the level of support that&apos;s right for you—from full-service application management to expert review.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-orange-50/90">
            <span className="flex items-center gap-2">✔ Licensed Professionals</span>
            <span className="flex items-center gap-2">✔ Fast Processing</span>
            <span className="flex items-center gap-2">✔ 100% Satisfaction Guarantee</span>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan, idx) => (
              <Card
                key={plan.name}
                className={`relative h-full border ${idx === 2 ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"} shadow-lg`}
              >
                {plan.badge && (
                  <div
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${idx === 2 ? "bg-amber-400 text-slate-900" : "bg-orange-50 text-orange-700 border border-orange-200"}`}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className={`space-y-3 ${plan.badge ? "p-6 pt-12" : "p-6"}`}>
                  <div className={`text-sm font-semibold ${idx === 2 ? "text-white" : "text-slate-700"}`}>{plan.name}</div>
                  <div className="text-3xl font-bold">{plan.price} <span className="text-sm font-normal text-slate-500">{idx === 2 ? "" : "one-time"}</span></div>
                  <p className={`text-sm ${idx === 2 ? "text-slate-200" : "text-slate-600"}`}>{plan.description}</p>
                  <Button className={`${plan.buttonClass} w-full`}>{plan.cta}</Button>
                  <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {idx === 0 ? "What's included:" : idx === 1 ? "Everything in Review & Send, plus:" : "Everything in Review & Workers Comp, plus:"}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.base?.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-300">
                        <Check className="h-4 w-4" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {plan.includes.map((item) => (
                      <li key={item} className={`flex items-start gap-2 ${idx === 2 ? "text-slate-100" : "text-slate-700"}`}>
                        <Check className="h-4 w-4 text-orange-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {plan.muted?.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-400">
                        <X className="h-4 w-4" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Compare All Plans</h2>
          <p className="text-sm text-slate-600">Choose the right level of support for your needs</p>
        </div>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Features</th>
                <th className="px-4 py-3 text-center font-semibold">Review & Send</th>
                <th className="px-4 py-3 text-center font-semibold bg-orange-50 text-orange-700">Review & Workers Comp</th>
                <th className="px-4 py-3 text-center font-semibold">We Do It All</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {featureTable.map((row) => (
                <tr key={row.label} className="text-center">
                  <td className="px-4 py-3 text-left font-medium text-slate-700">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 ${i === 1 ? "bg-orange-50" : ""} ${val === "—" ? "text-slate-400" : "text-slate-800"}`}
                    >
                      {val === "✔" ? <Check className="mx-auto h-4 w-4 text-orange-500" /> : val === "—" ? "—" : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600">Everything you need to know about our services</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.q} className="border border-slate-200 p-4">
              <div className="text-base font-semibold text-slate-900">{faq.q}</div>
              <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center">
          <h3 className="text-2xl font-bold">Ready to Get Licensed?</h3>
          <p className="text-sm text-orange-50/90">
            Join hundreds of contractors who trusted us with their licensing journey
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/application">
              <Button className="bg-white text-orange-600 hover:bg-orange-50 shadow">
                Start Your Application
              </Button>
            </Link>
            <Link href="/application">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

