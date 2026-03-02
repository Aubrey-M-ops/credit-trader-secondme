// src/proxy.ts
// server behavior
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Create a base response so Supabase can write refreshed session cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write new cookie values into the request for downstream handlers
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild supabaseResponse with updated request
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired — must not run any logic before this.
  // getUser() internally checks whether the access_token has expired.
  // If so, it uses the refresh_token from the cookie to obtain a new
  // access_token / refresh_token pair from Supabase, then writes the
  // new tokens back to supabaseResponse via the setAll callback above.
  // Token values are never exposed to application code.
  await supabase.auth.getUser();

  // 2. Run next-intl middleware on the (potentially cookie-updated) request
  const intlResponse = intlMiddleware(request);

  // 3. Copy any Supabase session cookies onto the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, { path: "/" });
  });

  return intlResponse;
}

export const config = {
    // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
  // - files with extensions (e.g. .js, .css, .png)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
