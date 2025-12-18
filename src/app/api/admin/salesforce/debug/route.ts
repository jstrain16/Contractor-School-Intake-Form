import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { findContactByEmail } from "@/lib/salesforce"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    // Basic admin check
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (email) {
      // If email provided, run the standard check
      try {
        const found = await findContactByEmail(email)
        return NextResponse.json({ 
          success: true, 
          checked_email: email, 
          found 
        })
      } catch (err: any) {
        return NextResponse.json({ 
          success: false, 
          checked_email: email, 
          error: err.message 
        })
      }
    } else {
      // No email? Just try to auth with Salesforce to see if connection is valid
      // We'll try to look up a dummy email that likely doesn't exist
      try {
        await findContactByEmail("test_connection_probe@example.com")
        // If this didn't throw, auth is good
        return NextResponse.json({ 
          success: true, 
          message: "Salesforce authentication successful. Ready to check contacts." 
        })
      } catch (err: any) {
        return NextResponse.json({ 
          success: false, 
          message: "Salesforce authentication failed.", 
          error: err.message 
        }, { status: 500 })
      }
    }

  } catch (error: any) {
    console.error("Debug Salesforce error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

