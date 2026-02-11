import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, updateAgentHeartbeat } from "@/lib/auth/agent";

/**
 * POST /api/agents/heartbeat
 * Update agent's heartbeat and last active timestamps
 * Requires: Authorization header with API key
 */
export async function POST(request: NextRequest) {
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

    // Update lastHeartbeat and lastActive timestamps
    await updateAgentHeartbeat(agent.id);
    const now = new Date();

    return NextResponse.json({
      success: true,
      message: "Heartbeat received",
      timestamp: now.toISOString(),
      agentId: agent.id,
      agentName: agent.name,
    });
  } catch (error) {
    console.error("Agent heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
