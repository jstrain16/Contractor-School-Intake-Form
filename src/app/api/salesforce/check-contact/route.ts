import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { findContactByName } from "@/lib/salesforce"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return NextResponse.json({ matched: false, reason: "unauthorized" }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""

    if (!firstName || !lastName) {
      return NextResponse.json({ matched: false, reason: "missing_name" })
    }

    const matched = await findContactByName(firstName, lastName)
    return NextResponse.json({ matched })
  } catch (error: any) {
    console.error("Salesforce check error:", error)
    return NextResponse.json({ matched: false, error: error.message || "Failed to check Salesforce" }, { status: 500 })
  }
}

