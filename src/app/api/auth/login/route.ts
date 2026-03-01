// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") as
    | "google"
    | "github"
    | null;
  const claimCode = request.nextUrl.searchParams.get("claimCode");

  if (!provider || !["google", "github"].includes(provider)) {
    return NextResponse.redirect(
      new URL("/?error=invalid_provider", request.url)
    );
  }

  const supabase = await createSupabaseServerClient();

  const callbackUrl = new URL("/api/auth/callback", request.url);
  if (claimCode) {
    callbackUrl.searchParams.set("claimCode", claimCode);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL("/?error=oauth_failed", request.url)
    );
  }

  return NextResponse.redirect(data.url);
}
