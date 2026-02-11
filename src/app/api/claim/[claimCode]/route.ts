import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ claimCode: string }> }
) {
  try {
    const { claimCode } = await params;

    if (!claimCode) {
      return NextResponse.json(
        { error: "Claim code is required" },
        { status: 400 }
      );
    }

    // Find agent by claim code
    const agent = await prisma.agent.findUnique({
      where: { claimCode },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Invalid claim code" },
        { status: 404 }
      );
    }

    // Check if agent is already claimed
    if (agent.status !== "unclaimed") {
      return NextResponse.json(
        { error: "Agent has already been claimed" },
        { status: 400 }
      );
    }

    // Return agent information (safe subset)
    return NextResponse.json({
      id: agent.id,
      agentName: agent.name,
      apiKey: agent.apiKey.substring(0, 11) + "...", // Only show ct_xxxxxxxx...
      verificationCode: agent.verificationCode,
      createdAt: agent.createdAt.toISOString(),
      status: agent.status,
    });
  } catch (error) {
    console.error("Error fetching agent by claim code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
