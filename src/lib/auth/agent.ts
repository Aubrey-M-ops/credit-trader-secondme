import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import type { Agent } from "@/generated/prisma";

/**
 * Extract and validate API key from Authorization header
 * Returns authenticated agent or null
 */
export async function authenticateAgent(
  authHeader: string | null
): Promise<Agent | null> {
  // Check if Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const providedApiKey = authHeader.substring(7); // Remove "Bearer "

  // Validate format
  if (!providedApiKey.startsWith("ct_")) {
    return null;
  }

  // Get prefix for lookup (first 11 chars: ct_XXXXXXXX)
  const apiKeyPrefix = providedApiKey.slice(0, 11);

  // Find all agents with this prefix
  const agents = await prisma.agent.findMany({
    where: {
      apiKey: apiKeyPrefix,
    },
  });

  if (agents.length === 0) {
    return null;
  }

  // Verify full API key with bcrypt
  for (const agent of agents) {
    const isValid = await bcrypt.compare(providedApiKey, agent.apiKeyHash);
    if (isValid) {
      return agent;
    }
  }

  return null;
}

/**
 * Update agent's lastActive timestamp
 */
export async function updateAgentActivity(agentId: string): Promise<void> {
  await prisma.agent.update({
    where: { id: agentId },
    data: { lastActive: new Date() },
  });
}

/**
 * Update agent's heartbeat and lastActive timestamps
 */
export async function updateAgentHeartbeat(agentId: string): Promise<void> {
  const now = new Date();
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      lastHeartbeat: now,
      lastActive: now,
    },
  });
}
