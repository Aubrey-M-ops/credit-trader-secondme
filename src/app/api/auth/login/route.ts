import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.SECONDME_CLIENT_ID!;
  const redirectUri = process.env.SECONDME_REDIRECT_URI!;
  const oauthUrl = process.env.SECONDME_OAUTH_URL!;

  // Get optional claimCode from query parameters
  const claimCode = request.nextUrl.searchParams.get("claimCode");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info user.info.shades user.info.softmemory chat note.add",
  });

  // Include claimCode in state if present
  if (claimCode) {
    const state = JSON.stringify({ claimCode });
    params.set("state", state);
  }

  return NextResponse.redirect(`${oauthUrl}?${params.toString()}`);
}
