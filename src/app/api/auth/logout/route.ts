// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearSession();
  return NextResponse.redirect(new URL("/", request.url));
}
