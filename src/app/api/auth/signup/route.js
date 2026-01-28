import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Household from "@/models/households";
import HouseholdMember from "@/models/householdMembers";
import PendingInvite from "@/models/pendingInvite";
import { sessionOptions } from "@/lib/session";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return Response.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { error: "User already exists with this email" },
        { status: 400 },
      );
    }

    // Check if there's a pending invite for this email
    const pendingInvite = await PendingInvite.findOne({
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() },
    });

    let householdId;
    let isJoiningExistingHousehold = false;

    if (pendingInvite) {
      // User is joining an existing household via invite
      householdId = pendingInvite.householdId;
      isJoiningExistingHousehold = true;
    } else {
      // Create a new household for this user
      householdId = new mongoose.Types.ObjectId();
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      householdId: householdId,
    });

    if (isJoiningExistingHousehold) {
      // Add user as member of existing household
      await HouseholdMember.create({
        householdId: householdId,
        userId: user._id,
        role: "member",
      });

      // Delete the pending invite
      await PendingInvite.deleteOne({ _id: pendingInvite._id });
    } else {
      // Create new household with user as owner
      await Household.create({
        _id: householdId,
        name: `${name}'s Household`,
        createdBy: user._id,
      });

      // Add user as owner of household
      await HouseholdMember.create({
        householdId: householdId,
        userId: user._id,
        role: "owner",
      });
    }

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.userId = user._id.toString();
    await session.save();

    return Response.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        householdId: user.householdId,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
