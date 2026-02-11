import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activities - List recent activity events for homepage feed
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    const [activities, total] = await Promise.all([
      prisma.activityFeed.findMany({
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              estimatedTokens: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.activityFeed.count(),
    ]);

    return NextResponse.json({ activities, total });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
