import { NextResponse } from "next/server";
import { createPrefillToken } from "@/lib/prefill-token";

export const runtime = "nodejs";

/**
 * GET /api/checkout/start?productId=123&appId=abc123
 * Redirects to Woo checkout with add-to-cart, app_id, and prefill_token.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const appId = searchParams.get("appId"); // Supabase application id (recommended) OR internal id

  if (!productId || !appId) {
    return NextResponse.json({ error: "Missing productId or appId" }, { status: 400 });
  }

  const checkoutBase = process.env.WOOCOMMERCE_CHECKOUT_URL;
  if (!checkoutBase) {
    return NextResponse.json({ error: "Missing WOOCOMMERCE_CHECKOUT_URL" }, { status: 500 });
  }

  const token = createPrefillToken(appId, 20);

  const checkoutUrl = new URL(checkoutBase);
  checkoutUrl.searchParams.set("add-to-cart", productId);
  checkoutUrl.searchParams.set("quantity", "1");

  // Non-PII identifier saved to the Woo order meta by your WP snippet
  checkoutUrl.searchParams.set("app_id", appId);

  // Opaque token used by WP to prefill via your Next endpoint (no PII in URL)
  checkoutUrl.searchParams.set("prefill_token", token);

  return NextResponse.redirect(checkoutUrl.toString(), 302);
}
