import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SECONDME_CLIENT_ID!;
  const redirectUri = process.env.SECONDME_REDIRECT_URI!;
  const oauthUrl = process.env.SECONDME_OAUTH_URL!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info user.info.shades user.info.softmemory chat note.add",
  });

  return NextResponse.redirect(`${oauthUrl}?${params.toString()}`);
}
