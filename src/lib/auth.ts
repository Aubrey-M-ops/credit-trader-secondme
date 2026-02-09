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
    maxAge: 60 * 60 * 24 * 30, // 30 days
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  // Token 仍然有效
  if (user.tokenExpiresAt > new Date()) {
    return user.accessToken;
  }

  // 尝试刷新 Token
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      refresh_token: user.refreshToken,
    });

    const refreshEndpoint = process.env.SECONDME_API_BASE_URL + "/api/oauth/token/refresh";
    const res = await fetch(refreshEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const tokenData = data.data ?? data;

    const newAccessToken = tokenData.accessToken ?? tokenData.access_token;
    const newRefreshToken = tokenData.refreshToken ?? tokenData.refresh_token ?? user.refreshToken;
    const expiresIn = tokenData.expiresIn ?? tokenData.expires_in ?? 7200;

    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return newAccessToken;
  } catch {
    return null;
  }
}
