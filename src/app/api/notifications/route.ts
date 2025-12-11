import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()
    const { data: profile } = await supabase.from("user_profiles").select("id").eq("user_id", userId).maybeSingle()
    if (!profile?.id) return NextResponse.json({ notifications: [] })

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("notifications fetch error", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({ notifications: data || [] })
  } catch (e) {
    console.error("GET /api/notifications error", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const notifId = body?.id
    const read = body?.read === true
    if (!notifId) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const supabase = getSupabaseAdminClient()
    // ensure recipient matches current user
    const { data: profile } = await supabase.from("user_profiles").select("id").eq("user_id", userId).maybeSingle()
    if (!profile?.id) return NextResponse.json({ ok: true })

    const { error } = await supabase
      .from("notifications")
      .update({ read })
      .eq("id", notifId)
      .eq("recipient_id", profile.id)

    if (error) {
      console.error("notifications update error", error)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("POST /api/notifications error", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
