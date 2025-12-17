import { NextResponse } from "next/server";
import { verifyPrefillToken } from "@/lib/prefill-token";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, serviceKey);
}

/**
 * GET /api/checkout/prefill?token=...
 * WordPress calls this server-to-server. Must return JSON:
 * { first_name, last_name, email }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = verifyPrefillToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const appId = payload.appId;

  try {
    const supabase = getSupabaseAdmin();
    // Fetch the application to get the user_id (which is the Clerk ID)
    const { data: appData, error: appError } = await supabase
      .from("contractor_applications")
      .select("user_id, data")
      .eq("id", appId)
      .single();

    if (appError || !appData) {
        console.error("Prefill app fetch error", appError);
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // First try to get data from Phase 1 (most reliable)
    let first_name = (appData.data?.phase1 as any)?.firstName;
    let last_name = (appData.data?.phase1 as any)?.lastName;
    let email = (appData.data?.phase1 as any)?.email;

    // If missing, try fallback to user_profiles
    if (!first_name || !last_name || !email) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, email")
            .eq("user_id", appData.user_id)
            .single();
        
        if (profile) {
            first_name = first_name || profile.first_name;
            last_name = last_name || profile.last_name;
            email = email || profile.email;
        }
    }

    // If still missing (unlikely), try clerk user details (but that requires clerk SDK, let's stick to DB for speed)
    // Fallback to empty string if really nothing
    first_name = first_name || "";
    last_name = last_name || "";
    email = email || "";

    return NextResponse.json({ first_name, last_name, email });

  } catch (error) {
      console.error("Prefill error", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
