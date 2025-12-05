import OpenAI from "openai"
import { Resend } from "resend"

export type EmailEnv = {
  openaiKey: string
  resendKey: string
  fromEmail: string
  replyTo?: string
}

export function getEmailEnv(): EmailEnv {
  const openaiKey = process.env.OPENAI_API_KEY
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM
  const replyTo = process.env.REMINDER_REPLY_TO

  if (!openaiKey) {
    throw new Error("Missing OPENAI_API_KEY")
  }
  if (!resendKey) {
    throw new Error("Missing RESEND_API_KEY")
  }
  if (!fromEmail) {
    throw new Error("Missing EMAIL_FROM")
  }

  return { openaiKey, resendKey, fromEmail, replyTo: replyTo || undefined }
}

export function getOpenAIClient() {
  const { openaiKey } = getEmailEnv()
  return new OpenAI({ apiKey: openaiKey })
}

export function getResendClient() {
  const { resendKey } = getEmailEnv()
  return new Resend(resendKey)
}

