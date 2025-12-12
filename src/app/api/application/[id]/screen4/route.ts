import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { screen4Schema } from "@/lib/schemas"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { recomputeSupportingMaterialsPlan } from "@/lib/supporting-materials"

const bodySchema = z.object({
  responses: screen4Schema,
})

async function assertOwnership(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  applicationId: string,
  userId: string
) {
  const { data, error } = await supabase.from("contractor_applications").select("id").eq("id", applicationId).eq("user_id", userId).maybeSingle()
  if (error) throw error
  if (!data) return false
  return true
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const supabase = getSupabaseAdminClient()

    const owns = await assertOwnership(supabase, applicationId, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { data } = await supabase.from("screen4_responses").select("*").eq("application_id", applicationId).maybeSingle()
    return NextResponse.json({ responses: data ?? null })
  } catch (err) {
    console.error("GET /api/application/[id]/screen4 error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await ctx.params
    const { userId } = await clerkAuth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const supabase = getSupabaseAdminClient()

    const owns = await assertOwnership(supabase, applicationId, userId)
    if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const parsed = bodySchema.parse(body)
    const payload = {
      ...parsed.responses,
      application_id: applicationId,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("screen4_responses")
      .upsert(payload, { onConflict: "application_id" })

    if (error) {
      console.error("screen4 upsert error", error)
      return NextResponse.json({ error: "Server error", detail: error.message }, { status: 500 })
    }

    await recomputeSupportingMaterialsPlan(applicationId, parsed.responses)

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: err.flatten() }, { status: 400 })
    }
    console.error("PATCH /api/application/[id]/screen4 error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

