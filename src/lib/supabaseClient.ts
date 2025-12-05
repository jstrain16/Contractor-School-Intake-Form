import { createClient } from "@supabase/supabase-js"

// Read from env; keep keys out of the repo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback to provided URL if env is missing (but keep key in env only).
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
}

export const supabase = createClient(
  supabaseUrl ?? "https://mdkkpjgujvksafwdqdun.supabase.co",
  supabaseKey ?? ""
)


