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
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "笔记内容不能为空" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/note/add`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "添加笔记失败", detail: errText },
      { status: res.status }
    );
  }

  const result = await res.json();
  return NextResponse.json(result);
}
