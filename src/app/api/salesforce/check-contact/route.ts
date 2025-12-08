import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { findContactByEmail } from "@/lib/salesforce"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return NextResponse.json({ matched: false, reason: "unauthorized" }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""

    if (!email) {
      return NextResponse.json({ matched: false, reason: "missing_email" })
    }

    const matched = await findContactByEmail(email)
    return NextResponse.json({ matched })
  } catch (error: any) {
    console.error("Salesforce check error:", error)
    return NextResponse.json({ matched: false, error: error.message || "Failed to check Salesforce" }, { status: 500 })
  }
}

