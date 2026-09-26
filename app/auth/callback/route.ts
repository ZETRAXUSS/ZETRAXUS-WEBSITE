import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google) + email-confirmation landing route. Exchanges the one-time
 * code for a session cookie, then forwards to `next` (same-origin only).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/profile";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const errorDescription = url.searchParams.get("error_description");
  const target = new URL("/auth/login", url.origin);
  target.searchParams.set("error", errorDescription ? "oauth" : "callback");
  return NextResponse.redirect(target);
}
