import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const applicationId = body?.applicationId as string | undefined
    if (!applicationId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Delete attachments first (if any)
    const { error: attError } = await supabase.from("contractor_attachments").delete().eq("application_id", applicationId)
    if (attError) {
      return NextResponse.json({ error: attError.message }, { status: 500 })
    }

    const { error } = await supabase.from("contractor_applications").delete().eq("id", applicationId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 })
  }
}


