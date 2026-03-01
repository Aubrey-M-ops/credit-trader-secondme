# Supabase OAuth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace SecondMe OAuth with Supabase OAuth (Google + GitHub), delete all SecondMe-dependent API routes, and update the Prisma User model accordingly.

**Architecture:** Use `@supabase/ssr` for Next.js App Router compatible session management. Supabase handles the OAuth handshake; our callback upserts a Prisma User keyed on `supabaseUserId`. We continue to maintain a `session_user_id` cookie pointing at the Prisma User for all downstream app logic.

**Tech Stack:** Next.js 16 App Router, `@supabase/ssr`, `@supabase/supabase-js` (already installed), Prisma 7 + Neon PostgreSQL, next-intl, TypeScript.

---

## Prerequisites (manual – not code tasks)

In the **Supabase Dashboard** before running the code:
1. **Authentication → Providers** – enable Google (paste Client ID + Secret from Google Cloud Console)
2. **Authentication → Providers** – enable GitHub (paste Client ID + Secret from GitHub OAuth App)
3. **Authentication → URL Configuration → Redirect URLs** – add `http://localhost:3000/api/auth/callback` (dev) and your production URL

New env vars to add to `.env.local` (and Vercel):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

### Task 1: Install @supabase/ssr

**Files:**
- Modify: `package.json` (via npm)

**Step 1: Install the package**

```bash
npm install @supabase/ssr
```

Expected: package-lock.json updated, `@supabase/ssr` appears in `dependencies`.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @supabase/ssr dependency"
```

---

### Task 2: Create Supabase client factory

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Create the file**

```typescript
// src/lib/supabase.ts
import { createServerClient } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

/** Client components */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Server components and API route handlers */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component – read-only, ignore
          }
        },
      },
    }
  );
}

/** Middleware – takes both request and mutable response */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors for the new file (env vars are non-null asserted).

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client factory (browser/server/middleware)"
```

---

### Task 3: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Replace the User model and remove ChatSession/ChatMessage/Note**

Replace the entire content of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id             String   @id @default(cuid())
  supabaseUserId String   @unique @map("supabase_user_id")
  email          String?
  name           String?
  avatarUrl      String?  @map("avatar_url")

  // Wallet fields
  balance     Decimal @default(100.00) @db.Decimal(10, 2)
  totalEarned Decimal @default(0.00) @map("total_earned") @db.Decimal(10, 2)
  totalSpent  Decimal @default(0.00) @map("total_spent") @db.Decimal(10, 2)

  // Statistics
  completedTasks Int      @default(0) @map("completed_tasks")
  rating         Decimal? @db.Decimal(3, 2)

  // Status
  status String @default("active")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  agents Agent[]

  @@map("users")
}

model Task {
  id               String @id @default(cuid())
  title            String
  description      String @db.Text
  context          Json?
  estimatedTokens  Int    @map("estimated_tokens")
  estimatedCredits Int    @map("estimated_credits")
  priority         String @default("medium")
  status           String @default("pending")

  publisherAgentId String @map("publisher_agent_id")
  publisherAgent   Agent  @relation("publisher", fields: [publisherAgentId], references: [id], onDelete: Cascade)

  workerAgentId String? @map("worker_agent_id")
  workerAgent   Agent?  @relation("worker", fields: [workerAgentId], references: [id], onDelete: SetNull)

  result       String? @db.Text
  actualTokens Int?    @map("actual_tokens")
  rating       Int?

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  acceptedAt  DateTime? @map("accepted_at")
  completedAt DateTime? @map("completed_at")

  creditTransactions CreditTransaction[]
  activityFeeds      ActivityFeed[]

  @@index([status])
  @@index([publisherAgentId])
  @@index([workerAgentId])
  @@index([priority])
  @@index([createdAt])
  @@map("tasks")
}

model CreditTransaction {
  id      String @id @default(cuid())
  taskId  String @map("task_id")
  task    Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  agentId String @map("agent_id")
  agent   Agent  @relation(fields: [agentId], references: [id], onDelete: Cascade)
  type    String
  credits Int
  tokens  Int
  balanceAfter Int    @map("balance_after")
  status       String @default("completed")
  description  String? @db.Text
  metadata     Json?
  createdAt    DateTime  @default(now()) @map("created_at")
  completedAt  DateTime? @map("completed_at")

  @@index([agentId])
  @@index([taskId])
  @@index([type])
  @@index([createdAt])
  @@map("credit_transactions")
}

model ActivityFeed {
  id        String  @id @default(cuid())
  eventType String  @map("event_type")
  agentId   String  @map("agent_id")
  agent     Agent   @relation(fields: [agentId], references: [id], onDelete: Cascade)
  taskId    String? @map("task_id")
  task      Task?   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title       String
  description String? @db.Text
  metadata    Json?
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([eventType])
  @@index([agentId])
  @@index([taskId])
  @@index([createdAt])
  @@map("activity_feeds")
}

model Agent {
  id         String @id @default(cuid())
  apiKey     String @unique @map("api_key")
  apiKeyHash String @map("api_key_hash")
  name       String

  claimCode        String @unique @map("claim_code")
  verificationCode String @map("verification_code")

  userId    String?   @map("user_id")
  user      User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  claimedAt DateTime? @map("claimed_at")

  credits           Int @default(100)
  totalEarned       Int @default(0) @map("total_earned")
  totalSpent        Int @default(0) @map("total_spent")
  tokensSaved       Int @default(0) @map("tokens_saved")
  tokensContributed Int @default(0) @map("tokens_contributed")
  tasksPublished    Int @default(0) @map("tasks_published")
  tasksCompleted    Int @default(0) @map("tasks_completed")
  reputation        Int @default(0)

  status        String    @default("unclaimed")
  lastActive    DateTime  @default(now()) @map("last_active")
  lastHeartbeat DateTime? @map("last_heartbeat")

  capabilities Json?
  preferences  Json?
  userAgent    String? @map("user_agent")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  publishedTasks     Task[]              @relation("publisher")
  workerTasks        Task[]              @relation("worker")
  creditTransactions CreditTransaction[]
  activityFeeds      ActivityFeed[]

  @@index([claimCode])
  @@index([userId])
  @@index([status])
  @@index([lastHeartbeat])
  @@map("agents")
}
```

**Step 2: Run migration**

```bash
npx prisma migrate dev --name supabase-auth
```

Expected output: migration file created in `prisma/migrations/`, Prisma client regenerated. If prompted about dropped tables (`chat_sessions`, `chat_messages`, `notes`), confirm — this is intentional.

**Step 3: Verify generated types**

```bash
npx tsc --noEmit
```

Expected: errors about `secondmeUserId` / `accessToken` etc. in auth files — that's fine, we'll fix them in the next tasks.

**Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "feat: migrate User model to supabase_user_id, drop chat/note tables"
```

---

### Task 4: Update src/lib/auth.ts

**Files:**
- Modify: `src/lib/auth.ts`

**Step 1: Replace file contents**

Remove `getValidAccessToken` entirely. Keep only session cookie helpers and `getCurrentUser`:

```typescript
// src/lib/auth.ts
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "session_user_id";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setSessionUserId(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
```

**Step 2: Verify no remaining references to getValidAccessToken**

```bash
grep -r "getValidAccessToken" src/
```

Expected: no output (zero matches).

**Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: remove SecondMe token refresh from auth lib"
```

---

### Task 5: Update login route

**Files:**
- Modify: `src/app/api/auth/login/route.ts`

**Step 1: Replace file contents**

```typescript
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/app/api/auth/login/route.ts
git commit -m "feat: replace SecondMe OAuth redirect with Supabase signInWithOAuth"
```

---

### Task 6: Update callback route

**Files:**
- Modify: `src/app/api/auth/callback/route.ts`

**Step 1: Replace file contents**

```typescript
// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const claimCode = request.nextUrl.searchParams.get("claimCode");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("Session exchange failed:", error);
      return NextResponse.redirect(
        new URL("/?error=token_failed", request.url)
      );
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email ?? null;
    const name =
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      email ??
      null;
    const avatarUrl = supabaseUser.user_metadata?.avatar_url ?? null;

    const user = await prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      create: { supabaseUserId: supabaseUser.id, email, name, avatarUrl },
      update: { email, name, avatarUrl },
    });

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Handle agent claiming
    if (claimCode) {
      try {
        const agent = await prisma.agent.findUnique({ where: { claimCode } });
        if (agent && agent.status === "unclaimed") {
          await prisma.agent.update({
            where: { id: agent.id },
            data: { userId: user.id, status: "active", claimedAt: new Date() },
          });
          await prisma.activityFeed.create({
            data: {
              eventType: "agent_claimed",
              agentId: agent.id,
              title: `${agent.name} was claimed`,
              description: `Agent ${agent.name} has been successfully claimed and linked to your account.`,
              metadata: {
                userId: user.id,
                claimCode,
                claimedAt: new Date().toISOString(),
              },
            },
          });
        }
      } catch (claimError) {
        console.error("Error claiming agent:", claimError);
        // Don't block login if claiming fails
      }
    }

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=callback_failed", request.url)
    );
  }
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors for this file.

**Step 3: Commit**

```bash
git add src/app/api/auth/callback/route.ts
git commit -m "feat: use Supabase exchangeCodeForSession in auth callback"
```

---

### Task 7: Update logout route

**Files:**
- Modify: `src/app/api/auth/logout/route.ts`

**Step 1: Replace file contents**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/app/api/auth/logout/route.ts
git commit -m "feat: add Supabase signOut to logout route"
```

---

### Task 8: Update middleware to refresh Supabase session

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Replace file contents**

```typescript
// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
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

  // Refresh session if expired — must not run any logic before this
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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Supabase session refresh to middleware"
```

---

### Task 9: Update Navbar – Google & GitHub login buttons

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1: Replace the unauthenticated login section (lines 109-116)**

Find this block in `src/components/Navbar.tsx`:

```tsx
        // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/api/auth/login"
            className="flex items-center justify-center font-inter text-[16px] font-semibold text-white rounded-[20px] px-5 py-2.5 bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] shadow-[0_4px_16px_rgba(224,122,58,0.35)] hover:shadow-[0_6px_20px_rgba(224,122,58,0.45)] hover:scale-[1.02] transition-all"
          >
            {t("startEarning")}
          </a>
```

Replace with:

```tsx
          <div className="flex items-center gap-2">
            {/* Google */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/auth/login?provider=google"
              className="flex items-center gap-2 font-inter text-[15px] font-medium text-[var(--text-primary)] rounded-lg px-4 py-2 border border-[var(--border-medium)] hover:bg-[var(--bg-tag)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </a>
            {/* GitHub */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/auth/login?provider=github"
              className="flex items-center gap-2 font-inter text-[15px] font-semibold text-white rounded-lg px-4 py-2 bg-[#24292e] hover:bg-[#1a1e22] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: replace single login button with Google/GitHub OAuth buttons"
```

---

### Task 10: Delete SecondMe-only API routes

**Files to delete:**
- `src/app/api/user/info/route.ts`
- `src/app/api/user/shades/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/act/route.ts`
- `src/app/api/note/route.ts`
- `src/app/api/sessions/route.ts`

**Step 1: Delete the files**

```bash
rm src/app/api/user/info/route.ts
rm src/app/api/user/shades/route.ts
rm src/app/api/chat/route.ts
rm src/app/api/act/route.ts
rm src/app/api/note/route.ts
rm src/app/api/sessions/route.ts
```

**Step 2: Check for broken imports**

```bash
grep -r "api/user/info\|api/user/shades\|api/chat\|api/act\|api/note\|api/sessions" src/ --include="*.ts" --include="*.tsx"
```

Expected: no matches (these were self-contained routes, not imported elsewhere).

**Step 3: Also remove lib/act.ts if only used by deleted routes**

```bash
grep -r "from.*lib/act\|from.*@/lib/act" src/ --include="*.ts" --include="*.tsx"
```

If only `src/app/api/act/route.ts` imported it (now deleted), run:

```bash
rm src/lib/act.ts
```

**Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: delete SecondMe-dependent API routes (chat, note, act, user/info, user/shades, sessions)"
```

---

### Task 11: Build verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: build completes with no TypeScript errors, no missing module errors.

**Step 2: If errors about SECONDME env vars in other files, find and clean them up**

```bash
grep -r "SECONDME" src/ --include="*.ts" --include="*.tsx"
```

Delete or update any remaining references.

**Step 3: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: clean up remaining SecondMe references"
```

---

## Supabase Dashboard Checklist (one-time manual setup)

- [ ] Google provider enabled with Client ID + Secret
- [ ] GitHub provider enabled with Client ID + Secret
- [ ] Redirect URL `{APP_URL}/api/auth/callback` added to allowed list
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to `.env.local` and Vercel environment variables
