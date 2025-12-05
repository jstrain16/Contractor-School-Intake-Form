import { currentUser } from "@clerk/nextjs/server"

export async function requireAdminEmail() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const isAllowed = email ? allowlist.includes(email) : false

  return { user, email, isAllowed }
}

