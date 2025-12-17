import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const prefillToken = "test"; // temporary for proof-of-wiring

  const checkoutUrl = new URL("https://beacontractor.com/checkout/");
  checkoutUrl.searchParams.set("add-to-cart", productId);
  checkoutUrl.searchParams.set("quantity", "1");
  checkoutUrl.searchParams.set("prefill_token", prefillToken);

  return NextResponse.redirect(checkoutUrl.toString(), 302);
}

