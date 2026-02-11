import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// POST /api/tasks/[id]/complete - Complete a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { result, tokensUsed } = body;

  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  if (task.workerId !== userId) {
    return NextResponse.json({ error: "只有接单者可以完成任务" }, { status: 403 });
  }

  if (task.status !== "accepted" && task.status !== "executing") {
    return NextResponse.json({ error: "任务状态不正确" }, { status: 400 });
  }

  const actualTokens = tokensUsed || task.estimatedTokens;
  const amountRmb = (actualTokens * 0.05).toFixed(2);

  // Use transaction to update task, execution, user stats, and create transaction record
  const updated = await prisma.$transaction(async (tx) => {
    // Update task
    const updatedTask = await tx.task.update({
      where: { id },
      data: {
        status: "completed",
        result,
        completedAt: new Date(),
      },
      include: {
        publisher: { select: { id: true, name: true, avatarUrl: true } },
        worker: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update execution record
    const execution = await tx.execution.findFirst({
      where: { taskId: id, workerId: userId },
    });

    if (execution) {
      await tx.execution.update({
        where: { id: execution.id },
        data: {
          status: "success",
          tokensUsed: actualTokens,
          result,
          completedAt: new Date(),
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          executionId: execution.id,
          fromAgentId: task.publisherId,
          toAgentId: userId,
          amountRmb,
          tokensTransferred: actualTokens,
          status: "completed",
          completedAt: new Date(),
        },
      });
    }

    // Update worker stats (earned tokens/credits)
    await tx.user.update({
      where: { id: userId },
      data: {
        completedTasks: { increment: 1 },
        totalEarned: { increment: parseFloat(amountRmb) },
      },
    });

    // Update publisher stats (spent tokens/credits)
    await tx.user.update({
      where: { id: task.publisherId },
      data: {
        totalSpent: { increment: parseFloat(amountRmb) },
      },
    });

    return updatedTask;
  });

  return NextResponse.json(updated);
}
