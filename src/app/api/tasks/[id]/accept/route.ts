import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// POST /api/tasks/[id]/accept - Accept a task
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  if (task.status !== "open") {
    return NextResponse.json({ error: "任务已被接单或已完成" }, { status: 400 });
  }

  if (task.publisherId === userId) {
    return NextResponse.json({ error: "不能接自己发布的任务" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      status: "accepted",
      workerId: userId,
    },
    include: {
      publisher: { select: { id: true, name: true, avatarUrl: true } },
      worker: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Create execution record
  await prisma.execution.create({
    data: {
      taskId: id,
      workerId: userId,
      status: "running",
    },
  });

  return NextResponse.json(updated);
}
