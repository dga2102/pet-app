import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import PendingInvite from "@/models/pendingInvite";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function POST(request) {
  try {
    await dbConnect();

    const { token } = await request.json();

    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 400 });
    }

    // Find pending invite
    const invite = await PendingInvite.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return Response.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    // Check if user is logged in
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      // User needs to sign up or login
      return Response.json({
        requiresAuth: true,
        email: invite.email,
        token,
      });
    }

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if invitation email matches user email
    if (user.email !== invite.email) {
      return Response.json(
        { error: "This invitation was sent to a different email address" },
        { status: 400 },
      );
    }

    // Check if user is already in the household
    const existingMember = await HouseholdMember.findOne({
      householdId: invite.householdId,
      userId: user._id,
    });

    if (existingMember) {
      // Delete the invite and return success
      await PendingInvite.deleteOne({ _id: invite._id });
      return Response.json({
        success: true,
        message: "You are already a member of this household",
      });
    }

    // Update user's household
    user.householdId = invite.householdId;
    await user.save();

    // Add user to household members
    await HouseholdMember.create({
      householdId: invite.householdId,
      userId: user._id,
      role: "member",
    });

    // Delete the invite
    await PendingInvite.deleteOne({ _id: invite._id });

    return Response.json({
      success: true,
      message: "Successfully joined household",
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return Response.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
