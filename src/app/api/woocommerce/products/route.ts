import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const baseUrl = process.env.WOOCOMMERCE_STORE_URL;
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!baseUrl || !ck || !cs) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const url = new URL("/wp-json/wc/v3/products", baseUrl);
  url.searchParams.set("status", "publish");
  url.searchParams.set("per_page", "50");
  
  // Basic Auth for WooCommerce
  const auth = Buffer.from(`${ck}:${cs}`).toString("base64");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json({ error: "Woo failed", details }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed", details: String(error) }, { status: 500 });
  }
}

