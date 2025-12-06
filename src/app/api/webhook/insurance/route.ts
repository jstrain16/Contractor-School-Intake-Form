import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { getWebhookInsuranceUrl } from "@/lib/env"
import { Step0Data, Step3Data, Step4Data } from "@/lib/schemas"

type InsuranceWebhookBody = {
  applicationId?: string | null
  step0?: Partial<Step0Data>
  step3?: Partial<Step3Data>
  step4?: Partial<Step4Data>
}

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as InsuranceWebhookBody
    const url = getWebhookInsuranceUrl()

    const payload = {
      source: "contractor-school",
      event: "insurance_contact_requested",
      timestamp: new Date().toISOString(),
      userId,
      applicationId: body.applicationId ?? null,
      contact: {
        firstName: body.step0?.firstName ?? null,
        lastName: body.step0?.lastName ?? null,
        email: body.step0?.email ?? null,
        phone: body.step0?.phone ?? null,
        preferredContact: body.step0?.preferredContact ?? null,
      },
      selections: {
        hasEmployees: body.step0?.hasEmployees ?? null,
        hasGlInsurance: body.step3?.hasGlInsurance ?? null,
        contactInsurancePartner: body.step3?.contactInsurancePartner ?? null,
        hasWorkersComp: body.step3?.hasWorkersComp ?? null,
        hasWcWaiver: body.step3?.hasWcWaiver ?? null,
        wantsInsuranceQuote: body.step4?.wantsInsuranceQuote ?? null,
      },
      trade: body.step0?.trade ?? null,
      primaryTrade: body.step4?.primaryTrade ?? null,
    }

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error("Webhook send failed", resp.status, text)
      return NextResponse.json(
        { error: "Webhook failed", detail: text || resp.statusText },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/webhook/insurance error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}


