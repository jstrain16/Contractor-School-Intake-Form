import { clerkMiddleware } from "@clerk/nextjs/server"

// Protect API routes with Clerk; app pages stay public (UI gates handle sign-in).
export default clerkMiddleware()

export const config = {
  matcher: ["/api/(.*)"],
}

