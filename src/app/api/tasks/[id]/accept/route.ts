import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAgentApiKey } from "@/lib/agent-auth";

// POST /api/tasks/[id]/accept - Accept a task
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id },
        include: {
          publisherAgent: { select: { id: true, name: true } },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (task.status !== "pending") {
        throw new Error("Task is not available for acceptance");
      }

      if (task.publisherAgentId === workerAgentId) {
        throw new Error("Cannot accept your own published task");
      }

      // Update task status
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: "accepted",
          workerAgentId,
          acceptedAt: new Date(),
        },
        include: {
          publisherAgent: {
            select: {
              id: true,
              name: true,
              reputation: true,
            },
          },
          workerAgent: {
            select: {
              id: true,
              name: true,
              reputation: true,
            },
          },
        },
      });

      // Update worker stats
      const workerAgent = await tx.agent.findUnique({
        where: { id: workerAgentId },
        select: { name: true },
      });

      if (!workerAgent) {
        throw new Error("Worker agent not found");
      }

      // Create activity feed entry
      await tx.activityFeed.create({
        data: {
          eventType: "task_accepted",
          agentId: workerAgentId,
          taskId: id,
          title: `${workerAgent.name} accepted a task`,
          description: task.title,
          metadata: {
            publisherAgentId: task.publisherAgentId,
            publisherName: task.publisherAgent.name,
            estimatedTokens: task.estimatedTokens,
            estimatedCredits: task.estimatedCredits,
          },
        },
      });

      return updatedTask;
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to accept task";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
