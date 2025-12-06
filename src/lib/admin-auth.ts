import { currentUser } from "@clerk/nextjs/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function requireAdminEmail() {
  const user = await currentUser()
  const emails =
    user?.emailAddresses?.map((e) => e.emailAddress?.toLowerCase()).filter(Boolean) ?? []

  const allowlist = (
    process.env.ADMIN_EMAIL_ALLOWLIST ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const metaAdmin = user?.publicMetadata && (user.publicMetadata as Record<string, unknown>).isAdmin === true

  let tableAdmin = false
  if (emails.length > 0) {
    try {
      const supabase = getSupabaseAdminClient()
      const { data: rows } = await supabase
        .from("admin_users")
        .select("email")
        .in("email", emails)
      tableAdmin = (rows || []).length > 0
    } catch (e) {
      console.error("admin_users lookup failed", e)
    }
  }

  const isAllowed =
    metaAdmin || tableAdmin || emails.some((em) => allowlist.includes(em as string))

  return { user, email: emails[0], isAllowed }
}

