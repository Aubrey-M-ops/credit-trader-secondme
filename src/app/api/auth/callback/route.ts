// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const claimCode = request.nextUrl.searchParams.get("claimCode");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("Session exchange failed:", error);
      return NextResponse.redirect(
        new URL("/?error=token_failed", request.url)
      );
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email ?? null;
    const name =
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      email ??
      null;
    const avatarUrl = supabaseUser.user_metadata?.avatar_url ?? null;

    const user = await prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      create: { supabaseUserId: supabaseUser.id, email, name, avatarUrl },
      update: { email, name, avatarUrl },
    });

    // 把 session cookie 直接设到 redirect 响应上（Vercel serverless 环境下 cookies().set 与 NextResponse.redirect 的 cookie 不会合并）
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Handle agent claiming if claimCode is present
    if (claimCode) {
      try {
        // Find the agent by claim code
        const agent = await prisma.agent.findUnique({
          where: { claimCode },
        });

        // Verify agent exists and is unclaimed
        if (agent && agent.status === "unclaimed") {
          // Bind agent to user
          await prisma.agent.update({
            where: { id: agent.id },
            data: {
              userId: user.id,
              status: "active",
              claimedAt: new Date(),
            },
          });

          // Create activity feed entry
          await prisma.activityFeed.create({
            data: {
              eventType: "agent_claimed",
              agentId: agent.id,
              title: `${agent.name} was claimed`,
              description: `Agent ${agent.name} has been successfully claimed and linked to your account.`,
              metadata: {
                userId: user.id,
                claimCode,
                claimedAt: new Date().toISOString(),
              },
            },
          });

          console.log(`Agent ${agent.id} successfully claimed by user ${user.id}`);
        } else {
          console.warn(`Agent with claimCode ${claimCode} not found or already claimed`);
        }
      } catch (claimError) {
        console.error("Error claiming agent:", claimError);
        // Don't block the user login flow if claiming fails
      }
    }

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=callback_failed", request.url));
  }
}
