import { currentUser } from "@clerk/nextjs/server"

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
  const isAllowed =
    metaAdmin || emails.some((em) => allowlist.includes(em as string))

  return { user, email: emails[0], isAllowed }
}

