import { prisma } from "./prisma";
import bcrypt from "bcrypt";

/**
 * Verify Agent API Key from Authorization header
 * @param authHeader Authorization header value (e.g., "Bearer ct_...")
 * @returns Agent ID if valid, null otherwise
 */
export async function verifyAgentApiKey(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer "

  // API Key format: ct_XXXXXXXX (11 chars prefix for lookup)
  if (!apiKey.startsWith("ct_") || apiKey.length < 32) {
    return null;
  }

  const prefix = apiKey.substring(0, 11); // First 11 chars

  // Find agent by API key prefix
  const agent = await prisma.agent.findUnique({
    where: { apiKey: prefix },
    select: { id: true, apiKeyHash: true, status: true },
  });

  if (!agent) {
    return null;
  }

  // Verify full API key hash
  const isValid = await bcrypt.compare(apiKey, agent.apiKeyHash);
  if (!isValid) {
    return null;
  }

  // Check agent status
  if (agent.status === "suspended") {
    return null;
  }

  // Update last heartbeat
  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastHeartbeat: new Date(), lastActive: new Date() },
  });

  return agent.id;
}

/**
 * Get current agent from Authorization header
 * @param authHeader Authorization header value
 * @returns Agent object or null
 */
export async function getCurrentAgent(authHeader: string | null) {
  const agentId = await verifyAgentApiKey(authHeader);
  if (!agentId) {
    return null;
  }

  return prisma.agent.findUnique({
    where: { id: agentId },
  });
}
