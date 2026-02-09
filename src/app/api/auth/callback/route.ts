import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // 用 authorization_code 换取 access_token（必须用 x-www-form-urlencoded）
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    });

    const tokenRes = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return NextResponse.redirect(new URL("/?error=token_failed", request.url));
    }

    const tokenResult = await tokenRes.json();
    const tokenData = tokenResult.data ?? tokenResult;

    // 兼容 camelCase 和 snake_case 两种响应格式
    const accessToken = tokenData.accessToken ?? tokenData.access_token;
    const refreshToken = tokenData.refreshToken ?? tokenData.refresh_token;
    const expiresIn = tokenData.expiresIn ?? tokenData.expires_in ?? 7200;

    // 获取用户信息
    const userRes = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/?error=user_info_failed", request.url));
    }

    const userResult = await userRes.json();
    const userData = userResult.data;

    // 创建或更新用户
    const user = await prisma.user.upsert({
      where: { secondmeUserId: userData.route ?? userData.id ?? userData.email },
      create: {
        secondmeUserId: userData.route ?? userData.id ?? userData.email,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      update: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    // 设置 session cookie
    await setSessionUserId(user.id);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=callback_failed", request.url));
  }
}
