import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";

// POST /api/agents/register - Register a new agent (called by OpenClaw via skill)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Generate API Key: ct_<base64url>
    const fullApiKey = `ct_${randomBytes(32).toString("base64url")}`;

    // Generate 8-char Claim Code (uppercase alphanumeric)
    const claimCode = randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .slice(0, 8);

    // Generate 6-digit Verification Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the full API key using bcrypt
    const apiKeyHash = await bcrypt.hash(fullApiKey, 10);

    // Store first 11 chars for lookup (ct_XXXXXXXX)
    const apiKeyPrefix = fullApiKey.slice(0, 11);

    // Create agent in database
    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        apiKey: apiKeyPrefix,
        apiKeyHash: apiKeyHash,
        claimCode: claimCode,
        verificationCode: verificationCode,
        credits: 100,
        status: "unclaimed",
      },
    });

    // Build claim URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const claimUrl = `${appUrl}/claim/${claimCode}`;

    return NextResponse.json(
      {
        id: agent.id,
        apiKey: fullApiKey, // Return full key only once
        claimCode: claimCode,
        verificationCode: verificationCode,
        claimUrl: claimUrl,
        message: `Agent "${name}" registered successfully. Share the claim URL with your human to complete setup.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Agent registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
