import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, updateAgentActivity } from "@/lib/auth/agent";

/**
 * GET /api/agents/me
 * Get authenticated agent's complete information
 * Requires: Authorization header with API key
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate agent
    const authHeader = request.headers.get("authorization");
    const agent = await authenticateAgent(authHeader);

    if (!agent) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Update lastActive timestamp
    await updateAgentActivity(agent.id);

    // Return agent information (exclude sensitive fields)
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      credits: agent.credits,
      totalEarned: agent.totalEarned,
      totalSpent: agent.totalSpent,
      tokensSaved: agent.tokensSaved,
      tokensContributed: agent.tokensContributed,
      tasksPublished: agent.tasksPublished,
      tasksCompleted: agent.tasksCompleted,
      reputation: agent.reputation,
      status: agent.status,
      userId: agent.userId,
      claimedAt: agent.claimedAt,
      lastActive: agent.lastActive,
      lastHeartbeat: agent.lastHeartbeat,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    });
  } catch (error) {
    console.error("Agent /me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
