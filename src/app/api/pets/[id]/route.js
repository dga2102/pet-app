import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Pet from "@/models/pet";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find pet and verify it belongs to user's household
    const pet = await Pet.findById(id).populate("primaryCarer", "name email");

    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    if (pet.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json(pet);
  } catch (error) {
    console.error("Get pet error:", error);
    return Response.json({ error: "Failed to get pet" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const updates = await request.json();

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find pet and verify it belongs to user's household
    const pet = await Pet.findById(id);

    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    if (pet.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if user is trying to update primaryCarer
    if (updates.primaryCarer !== undefined) {
      // Check if user is household owner
      const membership = await HouseholdMember.findOne({
        householdId: user.householdId,
        userId: user._id,
      });

      if (!membership || membership.role !== "owner") {
        return Response.json(
          { error: "Only household owners can assign primary carers" },
          { status: 403 },
        );
      }
    }

    // Update pet
    const updatedPet = await Pet.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("primaryCarer", "name email");

    return Response.json(updatedPet);
  } catch (error) {
    console.error("Update pet error:", error);
    return Response.json({ error: "Failed to update pet" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find pet and verify it belongs to user's household
    const pet = await Pet.findById(id);

    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    if (pet.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete pet
    await Pet.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Pet deleted" });
  } catch (error) {
    console.error("Delete pet error:", error);
    return Response.json({ error: "Failed to delete pet" }, { status: 500 });
  }
}
