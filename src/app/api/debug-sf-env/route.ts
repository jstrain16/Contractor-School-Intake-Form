import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.SALESFORCE_CLIENT_ID,
    hasClientSecret: !!process.env.SALESFORCE_CLIENT_SECRET,
    refreshTokenLength: (process.env.SALESFORCE_REFRESH_TOKEN || "").length,
    loginUrl: process.env.SALESFORCE_LOGIN_URL,
  })
}


