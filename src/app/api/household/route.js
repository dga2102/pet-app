import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Household from "@/models/households";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return Response.json(
        { error: "Household name is required" },
        { status: 400 },
      );
    }

    // Get current user
    const currentUser = await User.findById(session.userId);

    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is household owner
    const membership = await HouseholdMember.findOne({
      householdId: currentUser.householdId,
      userId: currentUser._id,
    });

    if (!membership || membership.role !== "owner") {
      return Response.json(
        { error: "Only household owners can change the household name" },
        { status: 403 },
      );
    }

    // Update household name
    const household = await Household.findByIdAndUpdate(
      currentUser.householdId,
      { name: name.trim() },
      { new: true },
    );

    return Response.json({
      success: true,
      household: {
        id: household._id,
        name: household.name,
      },
    });
  } catch (error) {
    console.error("Update household name error:", error);
    return Response.json(
      { error: "Failed to update household name" },
      { status: 500 },
    );
  }
}

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

    // Get household
    const household = await Household.findById(currentUser.householdId);

    if (!household) {
      return Response.json({ error: "Household not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      household: {
        id: household._id,
        name: household.name,
        createdBy: household.createdBy,
      },
    });
  } catch (error) {
    console.error("Get household error:", error);
    return Response.json({ error: "Failed to get household" }, { status: 500 });
  }
}
