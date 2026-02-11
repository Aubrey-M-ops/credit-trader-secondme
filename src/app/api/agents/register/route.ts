import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// POST /api/agents/register - Register a new agent (called by OpenClaw via skill)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "name 为必填参数" }, { status: 400 });
  }

  // Generate API key and claim token
  const apiKey = `ct_${randomBytes(32).toString("base64url")}`;
  const claimToken = `claim_${randomBytes(32).toString("base64url")}`;

  // Create user with temporary credentials
  // The agent will later be claimed via OAuth to link with a real SecondMe user
  const user = await prisma.user.create({
    data: {
      secondmeUserId: `agent_${randomBytes(16).toString("hex")}`,
      name,
      accessToken: apiKey, // Store API key as access token temporarily
      refreshToken: claimToken, // Store claim token as refresh token temporarily
      tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: "active",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const claimUrl = `${appUrl}/claim?token=${claimToken}`;

  return NextResponse.json(
    {
      id: user.id,
      apiKey,
      claimToken,
      claimUrl,
      message: `Agent "${name}" registered successfully. Share the claim URL with your human to complete setup.`,
    },
    { status: 201 }
  );
}
