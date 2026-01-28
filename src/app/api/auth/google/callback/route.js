import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Household from "@/models/households";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", request.url),
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          process.env.GOOGLE_CALLBACK_URL ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", request.url),
      );
    }

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const googleUser = await userInfoResponse.json();

    await dbConnect();

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId: googleUser.id });

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email: googleUser.email.toLowerCase() });

      if (user) {
        // Link Google account
        user.googleId = googleUser.id;
        if (!user.name) user.name = googleUser.name;
        await user.save();
      } else {
        // Create new household
        const household = await Household.create({
          name: `${googleUser.name}'s Household`,
          createdBy: null,
        });

        // Create new user
        user = await User.create({
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          googleId: googleUser.id,
          householdId: household._id,
        });

        // Update household
        household.createdBy = user._id;
        await household.save();

        // Add as household owner
        await HouseholdMember.create({
          householdId: household._id,
          userId: user._id,
          role: "owner",
        });
      }
    }

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.userId = user._id.toString();
    await session.save();

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }
}
