import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    return NextResponse.json(
      { ok: false, error, errorDescription },
      { status: 400 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "missing_code" },
      { status: 400 }
    )
  }

  // For now, just echo the code so you can copy it and exchange manually.
  // If you want to automate the exchange, we can add that here.
  return NextResponse.json({ ok: true, code })
}

