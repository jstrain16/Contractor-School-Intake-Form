import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { findContactByEmail } from "@/lib/salesforce"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  console.log("Admin SF check API invoked")
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    console.log("Admin SF check for:", email)

    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      console.log("Admin SF check unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const exists = await findContactByEmail(email)
    console.log("Admin SF check result:", email, exists)
    return NextResponse.json({ exists })
  } catch (error: any) {
    console.error("Admin Salesforce check error:", error)
    // Don't block the UI if SF fails
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 })
  }
}

