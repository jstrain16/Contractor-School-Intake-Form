import { currentUser } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function requireAdminEmail() {
  const user = await currentUser()
  const emails =
    user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []
  const userId = user?.id

  let tableAdmin = false
  let profileAdmin = false

  if (emails.length > 0) {
    try {
      const supabase = getSupabaseAdminClient()
      const { data: rows } = await supabase.from("admin_users").select("email, role").in("email", emails)
      tableAdmin = (rows || []).length > 0
    } catch (e) {
      console.error("admin_users lookup failed", e)
    }
  }

  if (userId) {
    try {
      const supabase = getSupabaseAdminClient()
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle()
      if (profile?.role && ["admin", "super_admin"].includes(profile.role.toLowerCase())) {
        profileAdmin = true
      }
    } catch (e) {
      console.error("user_profiles lookup failed", e)
    }
  }

  const isAllowed = profileAdmin || tableAdmin

  return { user, email: emails[0], isAllowed }
}

