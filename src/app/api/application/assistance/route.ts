import { NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

const bodySchema = z.object({
  applicationId: z.string().uuid(),
  assistancePackage: z.enum(["free_checklist", "premium_app", "consultation", "full_service"]),
})

export async function PATCH(req: Request) {
  try {
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = bodySchema.parse(body)
    const supabase = getSupabaseAdminClient()

    const { data: app } = await supabase
      .from("contractor_applications")
      .select("id, data")
      .eq("id", parsed.applicationId)
      .eq("user_id", userId)
      .maybeSingle()
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const nextData = { ...(app.data || {}), assistancePackage: parsed.assistancePackage }

    const { error } = await supabase
      .from("contractor_applications")
      .update({ data: nextData, updated_at: new Date().toISOString() })
      .eq("id", parsed.applicationId)
      .eq("user_id", userId)

    if (error) {
      console.error("assistance update error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("PATCH /api/application/assistance error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

