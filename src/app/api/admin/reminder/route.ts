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

    const draft =
      manualDraft && manualDraft.trim().length > 0
        ? manualDraft
        : await generateDraft(appData, missingSteps, status.progress)

    if (!shouldSend) {
      return NextResponse.json({ draft, subject, missingSteps })
    }

    const { fromEmail, replyTo } = getEmailEnv()
    const resend = getResendClient()

    const textBody =
      draft ||
      fallbackDraft(
        missingSteps,
        profile?.first_name ?? appData?.step0?.firstName,
        status.progress
      )

    const sendResp = await resend.emails.send({
      from: fromEmail,
      to: [applicantEmail],
      subject,
      text: textBody,
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
  progress: number
) {
  try {
    const openai = getOpenAIClient()
    const firstName = data?.step0?.firstName
    const namePart = firstName ? `Hi ${firstName},` : "Hello,"
    const missingList = missing.map((m) => `- ${m.label}: ${m.hint}`).join("\n")

    const prompt = `
Write a concise reminder email (plain text) to an applicant about their contractor license application. 
Tone: encouraging, clear, friendly. Keep it under 150 words. Include:
- A greeting (${namePart})
- Current progress: ${progress}% complete
- Bulleted missing steps:
${missingList}
- A short call to action to return and finish in the portal.
`

    const res = await openai.responses.create({
      model: "gpt-4o-mini",
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
  progress?: number
) {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,"
  const list = missing.map((m) => `- ${m.label}: ${m.hint}`).join("\n")
  const pct = typeof progress === "number" ? `${progress}% complete.` : ""
  return `${greeting}

You’re ${pct} To finish your contractor application, please complete:
${list}

Once these are done, we can move you to the next stage. Reply if you have questions.`
}

