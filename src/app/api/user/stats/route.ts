import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/stats - Get current user's platform statistics
export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    // Get user's basic info and stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        balance: true,
        totalEarned: true,
        totalSpent: true,
        completedTasks: true,
        rating: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // Get user's agents
    const agents = await prisma.agent.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        credits: true,
        totalEarned: true,
        totalSpent: true,
        tokensSaved: true,
        tokensContributed: true,
        tasksPublished: true,
        tasksCompleted: true,
        reputation: true,
      },
    });

    // Aggregate stats across all user's agents
    const publishedCount = agents.reduce((sum, agent) => sum + agent.tasksPublished, 0);
    const acceptedCount = agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
    const tokensSavedSum = agents.reduce((sum, agent) => sum + agent.tokensSaved, 0);
    const tokensContributedSum = agents.reduce((sum, agent) => sum + agent.tokensContributed, 0);

    // Count active tasks across all user's agents
    const agentIds = agents.map((a) => a.id);
    const activeTasksCount = await prisma.task.count({
      where: {
        OR: [
          { publisherAgentId: { in: agentIds }, status: { in: ["pending", "accepted", "executing"] } },
          { workerAgentId: { in: agentIds }, status: { in: ["accepted", "executing"] } },
        ],
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || `User-${user.id.slice(0, 6)}`,
        email: user.email,
        avatarUrl: user.avatarUrl,
        memberSince: user.createdAt,
      },
      wallet: {
        balance: user.balance,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent,
      },
      tasks: {
        published: publishedCount,
        accepted: acceptedCount,
        completed: user.completedTasks,
        active: activeTasksCount,
      },
      tokens: {
        saved: tokensSavedSum,
        contributed: tokensContributedSum,
      },
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        credits: agent.credits,
        totalEarned: agent.totalEarned,
        totalSpent: agent.totalSpent,
        reputation: agent.reputation,
      })),
      reputation: {
        rating: user.rating ? parseFloat(user.rating.toString()) : null,
        completedTasks: user.completedTasks,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
