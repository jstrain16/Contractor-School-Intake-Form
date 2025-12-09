import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import {
  createContactAndOpportunityForUser,
  findContactByEmail,
  markAccountInContractorAppByBusinessEmail,
} from "@/lib/salesforce"

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

    // Check for matching Contact by email
    const matched = await findContactByEmail(email)

    // Also, if there's an Account whose Business_Email__c matches this email,
    // mark the Incontractorschoolapp__c checkbox on that Account and surface the name.
    let accountUpdated = false
    let accountName: string | null = null
    try {
      const { found, updated, name } = await markAccountInContractorAppByBusinessEmail(email)
      accountUpdated = found && updated
      if (found && name) {
        accountName = name
      }
    } catch (e) {
      console.error("Failed to mark Salesforce Account Incontractorschoolapp__c:", e)
    }

    // If no matching Contact, create a new Contact + Opportunity in Salesforce
    let createdContact = false
    let createdOpportunity = false
    if (!matched) {
      try {
        const firstName = user?.firstName || null
        const lastName = user?.lastName || null
        const { contactId, opportunityId } = await createContactAndOpportunityForUser({
          email,
          firstName,
          lastName,
        })
        createdContact = !!contactId
        createdOpportunity = !!opportunityId
      } catch (e) {
        console.error("Failed to create Salesforce Contact/Opportunity:", e)
      }
    }

    return NextResponse.json({
      matched: matched || createdContact,
      accountUpdated,
      accountName,
      createdContact,
      createdOpportunity,
    })
  } catch (error: any) {
    console.error("Salesforce check error:", error)
    return NextResponse.json({ matched: false, error: error.message || "Failed to check Salesforce" }, { status: 500 })
  }
}

