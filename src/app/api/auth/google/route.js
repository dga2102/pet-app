import { NextResponse } from "next/server";

export async function GET(request) {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleAuthUrl.searchParams.append("client_id", process.env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.append(
    "redirect_uri",
    process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
  );
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "openid email profile");
  googleAuthUrl.searchParams.append("access_type", "offline");
  googleAuthUrl.searchParams.append("prompt", "consent");

  return NextResponse.redirect(googleAuthUrl.toString());
}
