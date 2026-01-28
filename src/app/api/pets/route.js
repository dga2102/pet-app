import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Pet from "@/models/pet";
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
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get all pets for this household
    const pets = await Pet.find({ householdId: user.householdId })
      .populate("primaryCarer", "name email")
      .sort({ createdAt: -1 });

    return Response.json(pets);
  } catch (error) {
    console.error("Get pets error:", error);
    return Response.json({ error: "Failed to get pets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const petData = await request.json();

    // Create new pet
    const pet = await Pet.create({
      ...petData,
      householdId: user.householdId,
    });

    // Populate primaryCarer before returning
    await pet.populate("primaryCarer", "name email");

    return Response.json(pet, { status: 201 });
  } catch (error) {
    console.error("Create pet error:", error);
    return Response.json({ error: "Failed to create pet" }, { status: 500 });
  }
}
