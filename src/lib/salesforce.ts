import qs from "querystring"

type SalesforceAuthResponse = {
  access_token: string
  instance_url: string
  token_type: string
}

const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_USERNAME,
  SALESFORCE_PASSWORD,
  SALESFORCE_TOKEN,
  SALESFORCE_LOGIN_URL = "https://login.salesforce.com",
} = process.env

if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
  console.warn("Salesforce env vars missing: SALESFORCE_CLIENT_ID/SALESFORCE_CLIENT_SECRET")
}

async function getAccessToken(): Promise<SalesforceAuthResponse> {
  if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET || !SALESFORCE_USERNAME || !SALESFORCE_PASSWORD || !SALESFORCE_TOKEN) {
    throw new Error("Salesforce credentials are not fully configured")
  }

  const body = qs.stringify({
    grant_type: "password",
    client_id: SALESFORCE_CLIENT_ID,
    client_secret: SALESFORCE_CLIENT_SECRET,
    username: SALESFORCE_USERNAME,
    password: `${SALESFORCE_PASSWORD}${SALESFORCE_TOKEN}`,
  })

  const res = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Salesforce auth failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<SalesforceAuthResponse>
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

