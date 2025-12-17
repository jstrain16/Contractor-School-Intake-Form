import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type WooMeta = { key: string; value: any };
type WooOrder = {
  id: number;
  status: string; // pending, processing, completed, etc.
  meta_data?: WooMeta[];
  billing?: { email?: string };
  total?: string;
};

function verifyWooWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (!secret) throw new Error("Missing WC_WEBHOOK_SECRET");
  if (!signature) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-wc-webhook-signature");
  const rawBody = await req.text();

  try {
    if (!verifyWooWebhook(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (e) {
    console.error("Webhook verification error:", e);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const order = JSON.parse(rawBody) as WooOrder;

  // Consider paid if processing/completed (adjust if your $0 orders go straight to completed)
  const isPaid = order.status === "processing" || order.status === "completed";
  
  if (!isPaid) {
    return NextResponse.json({ ok: true, ignored: true, status: order.status });
  }

  // Pull application_id meta written by your WP snippet
  // It might be 'application_id' or 'app_id' depending on how the snippet saved it
  const appId =
    order.meta_data?.find((m) => m.key === "application_id")?.value ??
    order.meta_data?.find((m) => m.key === "app_id")?.value;

  if (!appId) {
    return NextResponse.json(
      { error: "Missing application_id on order meta", orderId: order.id },
      { status: 400 }
    );
  }

  // Update Supabase to unlock the application
  const supabase = getSupabaseAdminClient();

  // Fetch current data to preserve existing phases
  const { data: currentApp, error: fetchError } = await supabase
    .from("contractor_applications")
    .select("data")
    .eq("id", appId)
    .single();

  if (fetchError || !currentApp) {
    console.error("Supabase fetch failed", fetchError);
    return NextResponse.json({ error: "Application not found", details: fetchError }, { status: 404 });
  }

  const currentData = currentApp.data || {};
  
  // Check if already paid to avoid redundant writes
  const isAlreadyPaid = currentData.phase3?.classPaymentComplete === true;
  if (isAlreadyPaid) {
      return NextResponse.json({ ok: true, message: "Already marked as paid", appId });
  }

  // Merge updates
  const updatedData = {
      ...currentData,
      phase3: {
          ...(currentData.phase3 || {}),
          classPaymentComplete: true
      },
      payment: {
          orderId: order.id,
          status: 'paid',
          amount: order.total,
          confirmedAt: new Date().toISOString()
      }
  };

  const { error: updateError } = await supabase
    .from("contractor_applications")
    .update({
      data: updatedData,
      updated_at: new Date().toISOString(),
      // Optional: if these columns exist, update them too, but don't fail if they don't
      // We rely on 'data' JSONB for the UI state
    })
    .eq("id", appId);

  if (updateError) {
    console.error("Supabase update failed", updateError);
    return NextResponse.json({ error: "Supabase update failed", details: updateError }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: order.id, appId, status: "updated" });
}

