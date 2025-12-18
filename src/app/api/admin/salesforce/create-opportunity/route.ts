import { NextResponse } from "next/server"
import { requireAdminEmail } from "@/lib/admin-auth"
import { createLicensingOpportunity, getContactByEmail } from "@/lib/salesforce"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { isAllowed } = await requireAdminEmail()
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    // 1. Find Contact
    const contact = await getContactByEmail(email)
    if (!contact) {
      return NextResponse.json({ error: "No contact found for this email" }, { status: 404 })
    }

    // 2. Prepare Opp Data
    // Name: "[First] [Last] B100" or just "[Last] B100" if no first name
    const name = [contact.FirstName, contact.LastName, "B100"].filter(Boolean).join(" ")
    
    // Close Date: Jan 1st 2027
    const closeDate = "2027-01-01"
    
    // Lead Source: 25/30 Hr Course
    const leadSource = "25/30 Hr Course"

    // 3. Create Opportunity
    const oppId = await createLicensingOpportunity({
      contactId: contact.Id,
      accountId: contact.AccountId,
      name,
      closeDate,
      leadSource,
    })

    return NextResponse.json({ success: true, opportunityId: oppId })
  } catch (error: any) {
    console.error("Create Opp error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

