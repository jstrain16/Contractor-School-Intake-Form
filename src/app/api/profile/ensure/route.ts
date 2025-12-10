import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const firstName = user?.firstName || null
    const lastName = user?.lastName || null
    const phone = user?.phoneNumbers?.[0]?.phoneNumber || null
    const lastActive = user?.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : new Date().toISOString()
    const clerkId = userId

    const supabase = getSupabaseAdminClient()

    // Fetch existing to preserve role if present
    const { data: existing, error: existingErr } = await supabase
      .from("user_profiles")
      .select("role")
      .or(`email.eq.${email ?? ""},user_id.eq.${userId}`)
      .maybeSingle()
    if (existingErr) {
      console.error("ensure profile existing lookup failed", existingErr)
    }
    const resolvedRole = existing?.role ?? "applicant"

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          clerk_id: clerkId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          role: resolvedRole,
          last_active_at: lastActive,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .maybeSingle()

    if (error) {
      console.error("ensure profile upsert failed", error)
      return NextResponse.json({ error: "Failed to upsert profile" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err) {
    console.error("/api/profile/ensure error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

