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

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-wc-webhook-signature");
    const rawBody = await req.text();

    // 1. Validate Secret Availability
    const secret = process.env.WC_WEBHOOK_SECRET;
    
    // DEBUG LOGGING: Remove this after fixing the 401
    console.log("Webhook Debug:", {
        secretPresent: !!secret,
        secretLength: secret?.length,
        signatureReceived: signature,
        bodyLength: rawBody.length
    });

    if (!secret) {
      console.error("Missing WC_WEBHOOK_SECRET env var");
      return NextResponse.json({ error: "Server misconfiguration: WC_WEBHOOK_SECRET missing" }, { status: 500 });
    }

    // 2. Verify Signature
    if (!signature) {
       return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    console.log("Signature Debug:", {
        calculated: digest,
        received: signature,
        match: digest === signature
    });

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch {
      isValid = false; // TimingSafeEqual throws if lengths differ
    }

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse Body
    const order = JSON.parse(rawBody) as WooOrder;
    
    // Check for "webhook_id" which indicates a ping
    if ((order as any).webhook_id) {
        return NextResponse.json({ ok: true, message: "Webhook ping received" });
    }

    // Consider paid if processing/completed/pending (since payments move to pending immediately)
    // Adjust based on your business logic: if "pending payment" means "waiting for user to pay", don't unlock.
    // If "pending" means "paid, waiting for fulfillment", then unlock.
    // Standard Woo flow: Pending Payment (unpaid) -> Processing (paid) -> Completed (shipped/done).
    // If your gateway sets it to 'on-hold' or 'pending', verify if that means money is captured.
    
    // NOTE: User stated payments move immediately to pending. Assuming this implies successful auth/capture
    // or at least a state where we want to acknowledge the order. 
    // SAFEST: Only unlock on 'processing' or 'completed'.
    // IF you are sure 'pending' means paid in your setup, add it.
    // For now, let's keep it strict to 'processing' | 'completed' to avoid unlocking unpaid orders.
    // But let's LOG the status so we know why it might be ignored.
    
    console.log("Order Status Check:", { orderId: order.id, status: order.status });

    const isPaid = order.status === "processing" || order.status === "completed";
    
    if (!isPaid) {
      console.log(`Ignoring order ${order.id} with status: ${order.status}`);
      return NextResponse.json({ ok: true, ignored: true, status: order.status });
    }

    // 4. Extract App ID
    const appId =
      order.meta_data?.find((m) => m.key === "application_id")?.value ??
      order.meta_data?.find((m) => m.key === "app_id")?.value;

    if (!appId) {
      return NextResponse.json(
        { error: "Missing application_id on order meta", orderId: order.id },
        { status: 400 }
      );
    }

    // 5. Init Supabase (Safely)
    let supabase;
    try {
        supabase = getSupabaseAdminClient();
    } catch (err: any) {
        console.error("Supabase init failed:", err);
        return NextResponse.json({ error: "Server misconfiguration: Supabase init failed", details: err.message }, { status: 500 });
    }

    // 6. Update Application
    // Fetch current data to preserve existing phases
    const { data: currentApp, error: fetchError } = await supabase
      .from("contractor_applications")
      .select("data")
      .eq("id", appId)
      .single();

    if (fetchError || !currentApp) {
      console.error("Supabase fetch failed", fetchError);
      return NextResponse.json({ error: "Application not found", details: fetchError.message }, { status: 404 });
    }

    const currentData = currentApp.data || {};
    
    const isAlreadyPaid = currentData.phase3?.classPaymentComplete === true;
    if (isAlreadyPaid) {
        return NextResponse.json({ ok: true, message: "Already marked as paid", appId });
    }

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
      })
      .eq("id", appId);

    if (updateError) {
      console.error("Supabase update failed", updateError);
      return NextResponse.json({ error: "Supabase update failed", details: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderId: order.id, appId, status: "updated" });

  } catch (err: any) {
    console.error("Unexpected webhook error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
