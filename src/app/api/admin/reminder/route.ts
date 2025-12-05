import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { buildStatus, getMissingSteps } from "@/lib/progress"
import { getEmailEnv, getOpenAIClient, getResendClient } from "@/lib/email-clients"
import { WizardData } from "@/lib/schemas"

type ReminderRequest = {
  applicationId?: string
  draft?: string
  send?: boolean
  includeData?: boolean
}

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as ReminderRequest
    const applicationId = body.applicationId
    const shouldSend = body.send === true
    const manualDraft = body.draft
    const includeData = body.includeData !== false

    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: app, error: appErr } = await supabase
      .from("contractor_applications")
      .select("id,user_id,data")
      .eq("id", applicationId)
      .maybeSingle()

    if (appErr) {
      console.error("reminder fetch app error", appErr)
      return NextResponse.json({ error: "Unable to load application" }, { status: 500 })
    }
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email,first_name,last_name")
      .eq("user_id", app.user_id)
      .maybeSingle()

    const appData = (app.data ?? null) as Partial<WizardData> | null
    const missingSteps = getMissingSteps(appData)
    const status = buildStatus(appData)
    const applicantEmail = profile?.email ?? appData?.step0?.email

    if (!applicantEmail) {
      return NextResponse.json({ error: "No applicant email on file" }, { status: 400 })
    }

    const subject =
      manualDraft?.trim() && shouldSend
        ? "Contractor application – next steps"
        : `Reminder: steps to finish your contractor application (${status.progress}%)`

    const { openaiWorkflowId, openaiAssistantId } = getEmailEnv()
    const draft =
      manualDraft && manualDraft.trim().length > 0
        ? manualDraft
        : await generateDraft(
            appData,
            missingSteps,
            status.progress,
            includeData ? appData : null,
            {
              workflowId: openaiWorkflowId,
              assistantId: openaiAssistantId,
            }
          )

    if (!shouldSend) {
      return NextResponse.json({ draft, subject, missingSteps })
    }

    const { fromEmail, replyTo } = getEmailEnv()
    const resend = getResendClient()
    const signature = buildSignature()

    const textBody =
      draft ||
      fallbackDraft(
        missingSteps,
        profile?.first_name ?? appData?.step0?.firstName,
        status.progress,
        signature.text
      )

    const htmlBody = renderHtml(textBody, signature.html)

    const sendResp = await resend.emails.send({
      from: fromEmail,
      to: [applicantEmail],
      subject,
      text: textBody,
      html: htmlBody,
      replyTo: replyTo ? [replyTo] : undefined,
    })

    if (sendResp.error) {
      console.error("resend send error", sendResp.error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.info("reminder sent", {
      applicationId,
      to: applicantEmail,
      subject,
    })

    return NextResponse.json({ sent: true, draft: textBody, subject, missingSteps })
  } catch (err: unknown) {
    console.error("POST /api/admin/reminder error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}

async function generateDraft(
  data: Partial<WizardData> | null,
  missing: ReturnType<typeof getMissingSteps>,
  progress: number,
  fullData: Partial<WizardData> | null,
  opts?: { workflowId?: string; assistantId?: string }
) {
  try {
    const openai = getOpenAIClient()
    const firstName = data?.step0?.firstName
    const namePart = firstName ? `Hi ${firstName},` : "Hello,"
    const missingList = missing.map((m) => `- ${m.label}: ${m.hint}`).join("\n")

    const dataBlob =
      fullData && Object.keys(fullData).length > 0
        ? `\nFull application data (JSON):\n${JSON.stringify(fullData)}`
        : ""

    const prompt = `
Write a concise reminder email (plain text) to an applicant about their contractor license application.
Tone: encouraging, clear, friendly. Keep it under 150 words. Include:
- A greeting (${namePart})
- Current progress: ${progress}% complete
- Bulleted missing steps:
${missingList}
- A short call to action to return and finish in the portal.
${dataBlob}
`

    const model = opts?.assistantId || opts?.workflowId || "gpt-4o-mini"

    const res = await openai.responses.create({
      model,
      input: prompt,
      max_output_tokens: 260,
      temperature: 0.4,
    })

    const message = res.output_text?.trim()
    if (message) return message
    return fallbackDraft(missing, data?.step0?.firstName, progress)
  } catch (e) {
    console.error("openai generate draft error", e)
    return fallbackDraft(missing, data?.step0?.firstName, progress)
  }
}

function fallbackDraft(
  missing: ReturnType<typeof getMissingSteps>,
  firstName?: string,
  progress?: number,
  signatureText?: string
) {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,"
  const list = missing.map((m) => `- ${m.label}: ${m.hint}`).join("\n")
  const pct = typeof progress === "number" ? `${progress}% complete.` : ""
  const sig = signatureText ? `\n\n${signatureText}` : ""
  return `${greeting}

You’re ${pct} To finish your contractor application, please complete:
${list}

Once these are done, we can move you to the next stage. Reply if you have questions.${sig}`
}

function buildSignature() {
  const logoUrl =
    process.env.SIGNATURE_LOGO_URL ||
    "https://raw.githubusercontent.com/jstrain16/assets/main/integrated-companies-logo.png"
  const heading = process.env.SIGNATURE_HEADING || "Celebrating 25 Years In Business!"
  const nameTitle = process.env.SIGNATURE_NAME_TITLE || "Joe Strain | Business Advisor"
  const cell = process.env.SIGNATURE_CELL || "(385) 525-8927"
  const office = process.env.SIGNATURE_OFFICE || "(801) 487-3000"
  const fax = process.env.SIGNATURE_FAX || "(801) 412-0893"
  const address =
    process.env.SIGNATURE_ADDRESS ||
    "3191 S. Valley Street Suite #206\nSalt Lake City, UT 84109"
  const website = process.env.SIGNATURE_WEBSITE || "https://josephstrain.com"
  const mapUrl =
    process.env.SIGNATURE_MAP_URL ||
    "https://maps.google.com/?q=3191+S+Valley+Street+Suite+206+Salt+Lake+City+UT+84109"
  const confidentiality =
    process.env.SIGNATURE_CONFIDENTIALITY ||
    "Confidentiality Note: This e-mail and any attachments are confidential and may be protected by legal privilege. If you are not the intended recipient, be aware that any disclosure, copying, distribution or use of this e-mail or any attachment is prohibited. If you have received this e-mail in error, please notify us immediately by returning it to the sender and delete this copy from your system."

  const html = `
  <div style="font-family: Arial, sans-serif; color: #111; font-size: 14px; line-height: 1.5;">
    <div style="background:#2f5597; color:#fff; padding:8px 12px; font-weight:bold; font-size:16px;">
      ${heading}
    </div>
    <div style="padding:12px 0;">
      ${logoUrl ? `<img src="${logoUrl}" alt="Integrated Companies" style="max-width:420px; height:auto;"/>` : ""}
    </div>
    <div style="background:#2f5597; color:#fff; padding:8px 12px; font-weight:bold; font-size:16px;">
      ${nameTitle}
    </div>
    <div style="padding:12px 0; font-size:14px; color:#111;">
      <div>Cell ${cell} | Office ${office} | Fax ${fax}</div>
      <div>${address.replace(/\n/g, "<br/>")}</div>
      <div style="margin-top:6px;">
        <a href="${website}" style="color:#0b5dd7; text-decoration:underline;">website</a>
        &nbsp;|&nbsp;
        <a href="${mapUrl}" style="color:#0b5dd7; text-decoration:underline;">map</a>
      </div>
    </div>
    <div style="margin-top:16px; font-size:12px; color:#555; line-height:1.6;">
      ${confidentiality}
    </div>
  </div>
  `

  const text = `${heading}

${nameTitle}
Cell ${cell} | Office ${office} | Fax ${fax}
${address}
website: ${website}
map: ${mapUrl}

${confidentiality}`

  return { html, text }
}

function renderHtml(textBody: string, signatureHtml: string) {
  const paragraphs = textBody
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px 0; white-space:pre-wrap;">${escapeHtml(p)}</p>`)
    .join("")

  return `
  <div style="font-family: Arial, sans-serif; color:#111; font-size:14px; line-height:1.6;">
    ${paragraphs}
    <div style="margin-top:16px;">${signatureHtml}</div>
  </div>
  `
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
