import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FamilyProfile from "@/models/familyProfile";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { familyName, primaryContact } = body;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    let familyProfile = await FamilyProfile.findOne({ clerkId: userId });

    if (!familyProfile) {
      familyProfile = new FamilyProfile({
        clerkId: userId,
        familyName,
        primaryContact: {
          ...primaryContact,
          email: primaryContact.email || user.primaryEmailAddress?.emailAddress,
        },
      });

      await familyProfile.save();
    }

    return NextResponse.json(familyProfile, { status: 200 });
  } catch (error) {
    console.error("Error creating/updating family profile:", error);
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

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId })
      .populate("members")
      .populate("pets");

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(familyProfile, { status: 200 });
  } catch (error) {
    console.error("Error fetching family profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    const familyProfile = await FamilyProfile.findOneAndUpdate(
      { clerkId: userId },
      body,
      { new: true },
    )
      .populate("members")
      .populate("pets");

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(familyProfile, { status: 200 });
  } catch (error) {
    console.error("Error updating family profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
