# Supabase OAuth 替换 SecondMe OAuth 设计文档

**日期：** 2026-02-28
**分支：** feature/OAuth

## 背景

将现有的 SecondMe OAuth 认证替换为 Supabase OAuth，支持 Google 和 GitHub 登录。同时删除所有依赖 SecondMe access token 的 API 路由。

## 技术选型

- **认证库：** `@supabase/ssr`（官方推荐的 Next.js App Router 集成方案）
- **数据库：** 保留 Prisma + PostgreSQL，新增 `supabaseUserId` 字段替换 `secondmeUserId`
- **Session 管理：** Supabase cookie-based session（`@supabase/ssr` 自动处理刷新）+ 内部 `session_user_id` cookie 指向 Prisma User

## Auth 流程

```
用户点击 "Sign in with Google/GitHub"
  → GET /api/auth/login?provider=google|github
  → supabase.auth.signInWithOAuth({ provider, redirectTo })
  → 302 到 Google/GitHub 授权页
  → 授权成功 → 302 到 /api/auth/callback?code=...
  → supabase.auth.exchangeCodeForSession(code)
  → 获取 supabase user (email, name, avatar_url)
  → upsert Prisma User (where: supabaseUserId)
  → 设置 session_user_id cookie (Prisma user ID)
  → 302 到 /
```

## 文件改动

### 新增
- `src/lib/supabase.ts` — Supabase browser client + server client 工厂（基于 `@supabase/ssr`）

### 修改
| 文件 | 改动描述 |
|------|---------|
| `package.json` | 添加 `@supabase/ssr` |
| `src/lib/auth.ts` | 删除 `getValidAccessToken`（SecondMe token 刷新逻辑），保留 `getSessionUserId / setSessionUserId / clearSession / getCurrentUser` |
| `src/app/api/auth/login/route.ts` | 读取 `provider` query param，调用 `supabase.auth.signInWithOAuth()` |
| `src/app/api/auth/callback/route.ts` | 调用 `exchangeCodeForSession`，upsert Prisma User，保留 claimCode 逻辑 |
| `src/app/api/auth/logout/route.ts` | 调用 `supabase.auth.signOut()`，清除 session cookie |
| `src/middleware.ts` | 添加 Supabase session 刷新（createServerClient + getUser） |
| `prisma/schema.prisma` | User 模型：`secondmeUserId` → `supabaseUserId`，删除 `accessToken/refreshToken/tokenExpiresAt`；删除 `ChatSession/ChatMessage/Note` 模型 |
| `src/components/Navbar.tsx` | 登录区域改为 Google / GitHub 两个按钮（`/api/auth/login?provider=google` 和 `?provider=github`） |

### 删除
- `src/app/api/user/info/route.ts`
- `src/app/api/user/shades/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/act/route.ts`
- `src/app/api/note/route.ts`
- `src/app/api/sessions/route.ts`

## Prisma Schema 变更

```prisma
model User {
  id            String   @id @default(cuid())
  supabaseUserId String  @unique @map("supabase_user_id")  // 替换 secondmeUserId
  email         String?
  name          String?
  avatarUrl     String?  @map("avatar_url")
  // 删除: accessToken, refreshToken, tokenExpiresAt
  // 其余字段保持不变
  ...
}
// 删除: ChatSession, ChatMessage, Note 模型
```

## 环境变量

新增：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

删除：
```
SECONDME_CLIENT_ID
SECONDME_CLIENT_SECRET
SECONDME_OAUTH_URL
SECONDME_REDIRECT_URI
SECONDME_TOKEN_ENDPOINT
SECONDME_API_BASE_URL
```

## Supabase 控制台配置

在 Supabase Dashboard 中需要配置：
1. Authentication → Providers → 启用 Google（填写 Client ID + Secret）
2. Authentication → Providers → 启用 GitHub（填写 Client ID + Secret）
3. Authentication → URL Configuration → 添加 Redirect URL：`{APP_URL}/api/auth/callback`
