import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    anonKeyPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  })
}















