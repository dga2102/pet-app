import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Caretaker from "@/models/caretaker";
import FamilyProfile from "@/models/familyProfile";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    let familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      // Create default family profile if it doesn't exist
      familyProfile = new FamilyProfile({
        clerkId: userId,
        familyName: "My Family",
        primaryContact: { name: "Primary Contact" },
      });
      await familyProfile.save();
    }

    const caretaker = new Caretaker({
      ...body,
      familyProfileId: familyProfile._id,
    });

    await caretaker.save();

    familyProfile.members.push(caretaker._id);
    await familyProfile.save();

    return NextResponse.json(caretaker, { status: 201 });
  } catch (error) {
    console.error("Error creating caretaker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const caretakers = await Caretaker.find({
      familyProfileId: familyProfile._id,
    });

    return NextResponse.json(caretakers, { status: 200 });
  } catch (error) {
    console.error("Error fetching caretakers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
