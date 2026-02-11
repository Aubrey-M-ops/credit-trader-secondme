import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAgentApiKey } from "@/lib/agent-auth";

// GET /api/tasks - List tasks for feed
// Query params: status, limit, offset, role (publisher|worker - requires API Key)
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

  // Filter by current agent's role
  if (role === "publisher" || role === "worker") {
    const authHeader = request.headers.get("Authorization");
    const agentId = await verifyAgentApiKey(authHeader);

    if (!agentId) {
      return NextResponse.json({ error: "Unauthorized - Invalid API Key" }, { status: 401 });
    }

    if (role === "publisher") {
      where.publisherAgentId = agentId;
    } else {
      where.workerAgentId = agentId;
    }
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        publisherAgent: {
          select: {
            id: true,
            name: true,
            reputation: true,
            tasksPublished: true,
            tasksCompleted: true
          }
        },
        workerAgent: {
          select: {
            id: true,
            name: true,
            reputation: true,
            tasksCompleted: true
          }
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total });
}

// POST /api/tasks - Create a new task with credit locking
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const publisherAgentId = await verifyAgentApiKey(authHeader);

  if (!publisherAgentId) {
    return NextResponse.json({ error: "Unauthorized - Invalid API Key" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, estimatedTokens, context, priority } = body;

  if (!title || !description || !estimatedTokens) {
    return NextResponse.json(
      { error: "title, description, estimatedTokens are required" },
      { status: 400 }
    );
  }

  // Calculate credits to lock (1:1 ratio with tokens)
  const creditsLocked = estimatedTokens;

  try {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if agent has enough credits
      const agent = await tx.agent.findUnique({
        where: { id: publisherAgentId },
        select: { credits: true, name: true },
      });

      if (!agent) {
        throw new Error("Agent not found");
      }

      if (agent.credits < creditsLocked) {
        throw new Error(`Insufficient credits. Required: ${creditsLocked}, Available: ${agent.credits}`);
      }

      // Create task
      const task = await tx.task.create({
        data: {
          title,
          description,
          context: context || null,
          estimatedTokens,
          estimatedCredits: creditsLocked,
          priority: priority || "medium",
          status: "pending",
          publisherAgentId,
        },
        include: {
          publisherAgent: {
            select: {
              id: true,
              name: true,
              reputation: true,
            },
          },
        },
      });

      // Create credit transaction for locking
      const agentAfterLock = await tx.agent.update({
        where: { id: publisherAgentId },
        data: {
          credits: { decrement: creditsLocked },
          tasksPublished: { increment: 1 },
        },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          taskId: task.id,
          agentId: publisherAgentId,
          type: "spend",
          credits: creditsLocked,
          tokens: estimatedTokens,
          balanceAfter: agentAfterLock.credits,
          status: "completed",
          description: `Locked credits for task: ${title}`,
          completedAt: new Date(),
        },
      });

      // Create activity feed entry
      await tx.activityFeed.create({
        data: {
          eventType: "task_published",
          agentId: publisherAgentId,
          taskId: task.id,
          title: `${agent.name} published a task`,
          description: title,
          metadata: {
            estimatedTokens,
            creditsLocked,
            priority: priority || "medium",
          },
        },
      });

      return task;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
