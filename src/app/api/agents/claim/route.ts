import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agents/claim?code=XXXXX
 * Query agent information by claim code
 * Used during the claim flow to verify and display agent info before OAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Get claim code from query parameter
    const searchParams = request.nextUrl.searchParams;
    const claimCode = searchParams.get("code");

    if (!claimCode) {
      return NextResponse.json(
        { error: "Missing claim code parameter" },
        { status: 400 }
      );
    }

    // Find agent by claim code
    const agent = await prisma.agent.findUnique({
      where: {
        claimCode: claimCode.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        claimCode: true,
        verificationCode: true,
        userId: true,
        claimedAt: true,
        status: true,
        credits: true,
        createdAt: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Invalid claim code" },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (agent.userId && agent.claimedAt) {
      return NextResponse.json(
        {
          error: "This agent has already been claimed",
          claimedAt: agent.claimedAt,
        },
        { status: 409 }
      );
    }

    // Return agent information for claim verification
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      verificationCode: agent.verificationCode,
      status: agent.status,
      credits: agent.credits,
      createdAt: agent.createdAt,
      message: "Agent found and ready to be claimed",
    });
  } catch (error) {
    console.error("Agent claim query error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
