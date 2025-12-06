export const runtime = "nodejs"

import { NextResponse } from "next/server"

const DEFAULT_WORKFLOW_ID = "wf_693338edd2fc8190bb82b578bbc66e0b04919c0babb30dee"

export async function POST(req: Request) {
  const openaiKey = process.env.OPENAI_API_KEY
  const workflowId = process.env.CHATKIT_WORKFLOW_ID || process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || DEFAULT_WORKFLOW_ID

  if (!openaiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { deviceId?: string }
    const userId = body.deviceId || crypto.randomUUID()

    const res = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: userId,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error("ChatKit session create failed", res.status, text)
      return NextResponse.json(
        { error: "ChatKit session failed", detail: text || res.statusText, status: res.status },
        { status: 502 }
      )
    }

    const { client_secret } = await res.json()
    return NextResponse.json({ client_secret })
  } catch (err) {
    console.error("POST /api/chatkit/session error", err)
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}


