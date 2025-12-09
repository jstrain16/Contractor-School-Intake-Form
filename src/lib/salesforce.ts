import qs from "querystring"

type SalesforceAuthResponse = {
  access_token: string
  instance_url: string
  token_type: string
}

type SalesforceCreateResult = {
  id: string
  success: boolean
  errors: string[]
}

const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_REFRESH_TOKEN,
  SALESFORCE_USERNAME,
  SALESFORCE_PASSWORD,
  SALESFORCE_TOKEN,
  SALESFORCE_LOGIN_URL = "https://login.salesforce.com",
} = process.env

if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
  console.warn("Salesforce env vars missing: SALESFORCE_CLIENT_ID/SALESFORCE_CLIENT_SECRET")
}

async function getAccessToken(): Promise<SalesforceAuthResponse> {
  if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
    throw new Error("Salesforce credentials are not fully configured (need client id/secret)")
  }

  // 1) Prefer refresh token from env if present
  if (SALESFORCE_REFRESH_TOKEN) {
    try {
      const body = qs.stringify({
        grant_type: "refresh_token",
        client_id: SALESFORCE_CLIENT_ID,
        client_secret: SALESFORCE_CLIENT_SECRET,
        refresh_token: SALESFORCE_REFRESH_TOKEN,
      })

      const res = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })

      if (res.ok) {
        return (await res.json()) as SalesforceAuthResponse
      } else {
        const text = await res.text()
        throw new Error(`Salesforce auth failed: ${res.status} ${text}`)
      }
    } catch (err) {
      console.error("Error using Salesforce refresh token from env:", err)
      // Fall through to username/password if configured
    }
  }

  // 2) Fallback to username/password + security token if configured
  if (SALESFORCE_USERNAME && SALESFORCE_PASSWORD && SALESFORCE_TOKEN) {
    const body = qs.stringify({
      grant_type: "password",
      client_id: SALESFORCE_CLIENT_ID,
      client_secret: SALESFORCE_CLIENT_SECRET,
      username: SALESFORCE_USERNAME,
      password: `${SALESFORCE_PASSWORD}${SALESFORCE_TOKEN}`,
    })

    const res = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Salesforce auth failed: ${res.status} ${text}`)
    }

    return (await res.json()) as SalesforceAuthResponse
  }

  throw new Error(
    "Salesforce credentials are not fully configured (need client id/secret, plus either a refresh token (env/DB) or username/password/token)"
  )
}

export async function findContactByEmail(email: string): Promise<boolean> {
  const auth = await getAccessToken()
  const soql = `SELECT Id FROM Contact WHERE Email = '${email.replace(/'/g, "\\'")}' LIMIT 1`

  const url = `${auth.instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`
  const res = await fetch(url, {
    headers: {
      Authorization: `${auth.token_type} ${auth.access_token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Salesforce query failed: ${res.status} ${text}`)
  }

  const data: { records: Array<{ Id: string }> } = await res.json()
  return Array.isArray(data.records) && data.records.length > 0
}

// If an Account has Business_Email__c matching the given email, set Incontractorschoolapp__c = true
export async function markAccountInContractorAppByBusinessEmail(
  email: string
): Promise<{ found: boolean; updated: boolean; name?: string }> {
  const auth = await getAccessToken()
  const safeEmail = email.replace(/'/g, "\\'")
  const soql = `SELECT Id, Name, Incontractorschoolapp__c FROM Account WHERE Business_Email__c = '${safeEmail}' LIMIT 1`

  const queryUrl = `${auth.instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`
  const queryRes = await fetch(queryUrl, {
    headers: {
      Authorization: `${auth.token_type} ${auth.access_token}`,
      "Content-Type": "application/json",
    },
  })

  if (!queryRes.ok) {
    const text = await queryRes.text()
    throw new Error(`Salesforce Account query failed: ${queryRes.status} ${text}`)
  }

  const data: { records: Array<{ Id: string; Name?: string; Incontractorschoolapp__c?: boolean }> } =
    await queryRes.json()
  if (!Array.isArray(data.records) || data.records.length === 0) {
    return { found: false, updated: false }
  }

  const account = data.records[0]
  // Already checked, nothing to do
  if (account.Incontractorschoolapp__c === true) {
    return { found: true, updated: false, name: account.Name }
  }

  const updateUrl = `${auth.instance_url}/services/data/v57.0/sobjects/Account/${account.Id}`
  const updateRes = await fetch(updateUrl, {
    method: "PATCH",
    headers: {
      Authorization: `${auth.token_type} ${auth.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Incontractorschoolapp__c: true }),
  })

  if (!updateRes.ok) {
    const text = await updateRes.text()
    throw new Error(`Salesforce Account update failed: ${updateRes.status} ${text}`)
  }

  return { found: true, updated: true, name: account.Name }
}

// If no matching Contact exists, create a Contact and an Opportunity for this user
export async function createContactAndOpportunityForUser(params: {
  email: string
  firstName?: string | null
  lastName?: string | null
}): Promise<{ contactId: string; opportunityId: string }> {
  const auth = await getAccessToken()

  const headers = {
    Authorization: `${auth.token_type} ${auth.access_token}`,
    "Content-Type": "application/json",
  }

  const lastName = params.lastName && params.lastName.trim().length > 0 ? params.lastName : params.email

  // 1) Create Contact
  const contactRes = await fetch(`${auth.instance_url}/services/data/v57.0/sobjects/Contact`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      FirstName: params.firstName || undefined,
      LastName: lastName,
      Email: params.email,
    }),
  })

  if (!contactRes.ok) {
    const text = await contactRes.text()
    throw new Error(`Salesforce create Contact failed: ${contactRes.status} ${text}`)
  }

  const contactData = (await contactRes.json()) as SalesforceCreateResult
  if (!contactData.success || !contactData.id) {
    throw new Error(`Salesforce create Contact did not succeed: ${JSON.stringify(contactData)}`)
  }

  // 2) Create Opportunity
  const closeDate = new Date()
  closeDate.setDate(closeDate.getDate() + 30)
  const closeDateStr = closeDate.toISOString().slice(0, 10) // YYYY-MM-DD

  const oppName = `Contractor School Application - ${params.email}`

  const oppRes = await fetch(`${auth.instance_url}/services/data/v57.0/sobjects/Opportunity`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Name: oppName,
      StageName: "Prospecting",
      CloseDate: closeDateStr,
    }),
  })

  if (!oppRes.ok) {
    const text = await oppRes.text()
    throw new Error(`Salesforce create Opportunity failed: ${oppRes.status} ${text}`)
  }

  const oppData = (await oppRes.json()) as SalesforceCreateResult
  if (!oppData.success || !oppData.id) {
    throw new Error(`Salesforce create Opportunity did not succeed: ${JSON.stringify(oppData)}`)
  }

  return { contactId: contactData.id, opportunityId: oppData.id }
}

