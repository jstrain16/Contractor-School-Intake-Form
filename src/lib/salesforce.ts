import qs from "querystring"
import { getSupabaseAdminClient } from "./supabase-admin"

type SalesforceAuthResponse = {
  access_token: string
  instance_url: string
  token_type: string
}

const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_REFRESH_TOKEN, // legacy: used to bootstrap into DB if present
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

  const supabase = getSupabaseAdminClient()

  // 1) Try to use refresh token stored in Supabase
  try {
    const { data, error } = await supabase
      .from("salesforce_tokens")
      .select("id, refresh_token, instance_url")
      .eq("id", "singleton")
      .maybeSingle()

    if (error) {
      console.error("Failed to read Salesforce token from Supabase:", error)
    }

    if (data?.refresh_token) {
      const body = qs.stringify({
        grant_type: "refresh_token",
        client_id: SALESFORCE_CLIENT_ID,
        client_secret: SALESFORCE_CLIENT_SECRET,
        refresh_token: data.refresh_token,
      })

      const res = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })

      if (res.ok) {
        const json = (await res.json()) as SalesforceAuthResponse & { refresh_token?: string }

        // If Salesforce rotated the refresh token, store the new one
        if (json.refresh_token) {
          const { error: upsertError } = await supabase.from("salesforce_tokens").upsert(
            {
              id: "singleton",
              refresh_token: json.refresh_token,
              instance_url: json.instance_url,
            },
            { onConflict: "id" }
          )
          if (upsertError) {
            console.error("Failed to update Salesforce refresh token in Supabase:", upsertError)
          }
        }

        return json
      } else {
        const text = await res.text()
        console.error("Salesforce refresh_token grant failed, will try fallback:", text)
      }
    }
  } catch (err) {
    console.error("Error using stored Salesforce refresh token:", err)
  }

  // 2) If we have a bootstrap refresh token in env but nothing in DB, use it directly and persist to DB
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
        const json = (await res.json()) as SalesforceAuthResponse & { refresh_token?: string }

        const tokenToStore = json.refresh_token || SALESFORCE_REFRESH_TOKEN
        const { error: upsertError } = await supabase.from("salesforce_tokens").upsert(
          {
            id: "singleton",
            refresh_token: tokenToStore,
            instance_url: json.instance_url,
          },
          { onConflict: "id" }
        )
        if (upsertError) {
          console.error("Failed to persist Salesforce refresh token from env into Supabase:", upsertError)
        }

        return json
      } else {
        const text = await res.text()
        console.error("Salesforce env refresh_token grant failed, will try fallback:", text)
      }
    } catch (err) {
      console.error("Error using Salesforce refresh token from env:", err)
    }
  }

  // 3) Fallback to username/password + security token if configured
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

    const json = (await res.json()) as SalesforceAuthResponse & { refresh_token?: string }

    // If we get a refresh token here, store it in Supabase for future use
    if (json.refresh_token) {
      const { error: upsertError } = await supabase.from("salesforce_tokens").upsert(
        {
          id: "singleton",
          refresh_token: json.refresh_token,
          instance_url: json.instance_url,
        },
        { onConflict: "id" }
      )
      if (upsertError) {
        console.error("Failed to save Salesforce refresh token in Supabase:", upsertError)
      }
    }

    return json
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

