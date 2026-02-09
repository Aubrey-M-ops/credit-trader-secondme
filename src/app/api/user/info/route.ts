import { NextResponse } from "next/server";
import { getSessionUserId, getValidAccessToken } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return NextResponse.json({ error: "Token 已过期" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: res.status });
  }

  const result = await res.json();
  return NextResponse.json(result);
}
