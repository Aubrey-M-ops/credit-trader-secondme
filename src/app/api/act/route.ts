import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, getValidAccessToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    return NextResponse.json({ error: "Token 已过期" }, { status: 401 });
  }

  const body = await request.json();
  const { message, actionControl, sessionId, systemPrompt } = body;

  if (!message || !actionControl) {
    return NextResponse.json(
      { error: "message 和 actionControl 为必填参数" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/act/stream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        actionControl,
        sessionId,
        systemPrompt,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "Act 请求失败", detail: errText },
      { status: res.status }
    );
  }

  // 转发 SSE 流
  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
