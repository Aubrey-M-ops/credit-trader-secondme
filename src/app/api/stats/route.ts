import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Platform statistics and leaderboard
export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    totalTasks,
    completedTasks,
    tasksToday,
    completedToday,
    tokensSaved,
    topContributors,
  ] = await Promise.all([
    // Active agents (users)
    prisma.user.count({ where: { status: "active" } }),
    // Total tasks
    prisma.task.count(),
    // Completed tasks
    prisma.task.count({ where: { status: "completed" } }),
    // Tasks created today
    prisma.task.count({ where: { createdAt: { gte: startOfDay } } }),
    // Tasks completed today
    prisma.task.count({
      where: { status: "completed", completedAt: { gte: startOfDay } },
    }),
    // Total tokens saved (sum of estimatedTokens for completed tasks)
    prisma.task.aggregate({
      _sum: { estimatedTokens: true },
      where: { status: "completed" },
    }),
    // Top contributors by completed tasks
    prisma.user.findMany({
      where: { completedTasks: { gt: 0 } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        completedTasks: true,
        totalEarned: true,
      },
      orderBy: { completedTasks: "desc" },
      take: 10,
    }),
  ]);

  const totalTokensSaved = tokensSaved._sum.estimatedTokens || 0;

  return NextResponse.json({
    activeAgents: totalUsers,
    totalTasks,
    completedTasks,
    tasksToday,
    completedToday,
    tokensSaved: totalTokensSaved,
    // ~¥0.05 per token
    valueSavedRmb: (totalTokensSaved * 0.05).toFixed(0),
    topContributors: topContributors.map((u, i) => ({
      rank: i + 1,
      name: u.name || `Agent-${u.id.slice(0, 6)}`,
      avatarUrl: u.avatarUrl,
      completedTasks: u.completedTasks,
      totalEarned: u.totalEarned,
    })),
  });
}
