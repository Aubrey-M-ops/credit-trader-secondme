import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAgentApiKey } from "@/lib/agent-auth";

// POST /api/tasks/[id]/complete - Complete a task with credit transfer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("Authorization");
  const workerAgentId = await verifyAgentApiKey(authHeader);

  if (!workerAgentId) {
    return NextResponse.json({ error: "Unauthorized - Invalid API Key" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { result, actualTokens: bodyActualTokens } = body;

  try {
    // Use transaction to ensure all operations are atomic
    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          publisherAgent: { select: { id: true, name: true } },
          workerAgent: { select: { id: true, name: true } },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.workerAgentId !== workerAgentId) {
        throw new Error("Only the worker can complete this task");
      }

      if (task.status !== "accepted" && task.status !== "executing") {
        throw new Error(`Task status is ${task.status}, cannot complete`);
      }

      // Calculate actual credits used (use provided or estimated)
      const actualTokens = bodyActualTokens || task.estimatedTokens;
      const actualCredits = Math.min(actualTokens, task.estimatedCredits);
      const refundCredits = task.estimatedCredits - actualCredits;

      // Transfer credits to worker
      const workerAfterEarn = await tx.agent.update({
        where: { id: workerAgentId },
        data: {
          credits: { increment: actualCredits },
          totalEarned: { increment: actualCredits },
          tokensContributed: { increment: actualTokens },
          tasksCompleted: { increment: 1 },
        },
        select: { credits: true, name: true },
      });

      // Create credit transaction for worker earning
      await tx.creditTransaction.create({
        data: {
          taskId: id,
          agentId: workerAgentId,
          type: "earn",
          credits: actualCredits,
          tokens: actualTokens,
          balanceAfter: workerAfterEarn.credits,
          status: "completed",
          description: `Earned credits for completing task: ${task.title}`,
          completedAt: new Date(),
        },
      });

      // Refund remaining credits to publisher if any
      if (refundCredits > 0) {
        const publisherAfterRefund = await tx.agent.update({
          where: { id: task.publisherAgentId },
          data: {
            credits: { increment: refundCredits },
            tokensSaved: { increment: task.estimatedTokens - actualTokens },
          },
          select: { credits: true },
        });

        await tx.creditTransaction.create({
          data: {
            taskId: id,
            agentId: task.publisherAgentId,
            type: "earn",
            credits: refundCredits,
            tokens: task.estimatedTokens - actualTokens,
            balanceAfter: publisherAfterRefund.credits,
            status: "completed",
            description: `Refund for task completion: ${task.title} (saved ${refundCredits} credits)`,
            completedAt: new Date(),
          },
        });
      }

      // Update task
      const completedTask = await tx.task.update({
        where: { id },
        data: {
          status: "completed",
          result,
          actualTokens,
          completedAt: new Date(),
        },
        include: {
          publisherAgent: {
            select: {
              id: true,
              name: true,
              reputation: true,
              credits: true,
            },
          },
          workerAgent: {
            select: {
              id: true,
              name: true,
              reputation: true,
              credits: true,
              totalEarned: true,
              tasksCompleted: true,
            },
          },
        },
      });

      // Create activity feed entry
      await tx.activityFeed.create({
        data: {
          eventType: "task_completed",
          agentId: workerAgentId,
          taskId: id,
          title: `${workerAfterEarn.name} completed a task`,
          description: task.title,
          metadata: {
            actualTokens,
            actualCredits,
            refundCredits,
            publisherAgentId: task.publisherAgentId,
            publisherName: task.publisherAgent.name,
          },
        },
      });

      return completedTask;
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to complete task";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
