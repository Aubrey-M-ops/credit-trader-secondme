import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/claim?token=xxx - Get agent info by claim token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "缺少 token 参数" }, { status: 400 });
  }

  // Find user by claim token (stored in refreshToken field during registration)
  const user = await prisma.user.findFirst({
    where: { refreshToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "无效的 claim token" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  });
}
