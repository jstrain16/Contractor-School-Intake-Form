import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { getEmailEnv, getResendClient } from "@/lib/email-clients"

export async function POST(req: Request) {
  try {
    const { isAllowed, email: inviterEmail } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = (await req.json()) as { email?: string; role?: string }
    const email = body.email?.trim().toLowerCase()
    const role = body.role?.trim().toLowerCase() || "admin"

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const { error } = await supabase
      .from("admin_users")
      .upsert({
        email,
        role,
        invited_by: inviterEmail || null,
      })

    if (error) {
      console.error("invite admin upsert error", error)
      return NextResponse.json({ error: "Failed to invite admin" }, { status: 500 })
    }

    // Send an invite email with a link to create/sign in
    try {
      const resend = getResendClient()
      const { fromEmail, replyTo } = getEmailEnv()
      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://contractor-school-intake-form.vercel.app"
      const signUpUrl = `${origin.replace(/\/$/, "")}/sign-up?redirect_url=/admin`
      const signInUrl = `${origin.replace(/\/$/, "")}/sign-in?redirect_url=/admin`

      const subject = "You’re invited to Contractor School Admin"
      const text = `Hello,

You’ve been granted admin access to Contractor School.

Create your account (or sign in) with this email to manage applicants:
- Create account: ${signUpUrl}
- Sign in if you already have an account: ${signInUrl}

If you weren’t expecting this invite, you can ignore this email.`

      const html = `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
          <h2 style="margin:0 0 12px 0; font-size:18px;">You’re invited to Contractor School Admin</h2>
          <p style="margin:0 0 12px 0;">You’ve been granted admin access. Use this email to sign up or sign in to manage applicants.</p>
          <p style="margin:0 0 12px 0;">
            <a href="${signUpUrl}" style="background:#f97316;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600;">Create account</a>
          </p>
          <p style="margin:0 0 8px 0;">Already have an account? <a href="${signInUrl}" style="color:#0b5dd7;text-decoration:underline;">Sign in</a></p>
          <p style="margin:16px 0 0 0; font-size:12px; color:#555;">If you weren’t expecting this invite, you can ignore this email.</p>
        </div>
      `

      const sendResp = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject,
        text,
        html,
        replyTo: replyTo ? [replyTo] : undefined,
      })

      if (sendResp.error) {
        console.error("admin invite email error", sendResp.error)
      }
    } catch (emailErr) {
      console.error("admin invite email send failed", emailErr)
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (err) {
    console.error("POST /api/admin/invite error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


