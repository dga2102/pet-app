import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get current user
    const currentUser = await User.findById(session.userId);

    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get all household members
    const members = await HouseholdMember.find({
      householdId: currentUser.householdId,
    }).populate("userId", "name email phone avatar createdAt");

    // Format the response
    const formattedMembers = members.map((member) => ({
      id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      phone: member.userId.phone || "",
      avatar: member.userId.avatar || "",
      role: member.role,
      joinedAt: member.joinedAt,
      memberSince: member.joinedAt,
    }));

    return Response.json({
      success: true,
      members: formattedMembers,
    });
  } catch (error) {
    console.error("Get household members error:", error);
    return Response.json(
      { error: "Failed to get household members" },
      { status: 500 },
    );
  }
}
