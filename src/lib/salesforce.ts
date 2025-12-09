import qs from "querystring"

type SalesforceAuthResponse = {
  access_token: string
  instance_url: string
  token_type: string
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

