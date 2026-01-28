import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { Resend } from "resend";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import PendingInvite from "@/models/pendingInvite";
import { sessionOptions } from "@/lib/session";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email already has a user in this household
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      householdId: user.householdId,
    });

    if (existingUser) {
      return Response.json(
        { error: "User is already in this household" },
        { status: 400 },
      );
    }

    // Check if there's already a pending invite
    const existingInvite = await PendingInvite.findOne({
      email: email.toLowerCase(),
      householdId: user.householdId,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return Response.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 },
      );
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString("hex");

    // Create pending invite
    await PendingInvite.create({
      email: email.toLowerCase(),
      householdId: user.householdId,
      invitedBy: user._id,
      token,
    });

    // Send email via Resend
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: `${user.name} invited you to join their household`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2c3e50; margin-bottom: 20px;">Household Invitation</h1>
              <p style="font-size: 16px;">Hi there!</p>
              <p style="font-size: 16px;"><strong>${user.name}</strong> has invited you to join their household.</p>
              <div style="margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 14px; color: #666;">This invitation will expire in 7 days.</p>
              <p style="font-size: 14px; color: #666;">If you don't recognize this invitation, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    return Response.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Send invite error:", error);
    return Response.json(
      { error: "Failed to send invitation" },
      { status: 500 },
    );
  }
}
