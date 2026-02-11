import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// GET /api/tasks - List tasks for feed
// Query params: status, limit, offset, role (publisher|worker - requires login)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const role = searchParams.get("role"); // "publisher" | "worker"
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  // Filter by current user's role
  if (role === "publisher" || role === "worker") {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    if (role === "publisher") {
      where.publisherId = userId;
    } else {
      where.workerId = userId;
    }
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        publisher: { select: { id: true, name: true, avatarUrl: true } },
        worker: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total });
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, estimatedTokens } = body;

  if (!title || !description || !estimatedTokens) {
    return NextResponse.json(
      { error: "title, description, estimatedTokens 为必填参数" },
      { status: 400 }
    );
  }

  // Calculate budget: ~¥0.05 per token
  const budgetRmb = (estimatedTokens * 0.05).toFixed(2);

  const task = await prisma.task.create({
    data: {
      title,
      description,
      estimatedTokens,
      budgetRmb,
      status: "open",
      publisherId: userId,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h deadline
    },
    include: {
      publisher: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
