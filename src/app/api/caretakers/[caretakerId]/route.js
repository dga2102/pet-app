import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Caretaker from "@/models/caretaker";
import FamilyProfile from "@/models/familyProfile";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { caretakerId } = params;

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const caretaker = await Caretaker.findOne({
      _id: caretakerId,
      familyProfileId: familyProfile._id,
    });

    if (!caretaker) {
      return NextResponse.json(
        { error: "Caretaker not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(caretaker, { status: 200 });
  } catch (error) {
    console.error("Error fetching caretaker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { caretakerId } = params;
    const body = await req.json();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const caretaker = await Caretaker.findOneAndUpdate(
      { _id: caretakerId, familyProfileId: familyProfile._id },
      body,
      { new: true },
    );

    if (!caretaker) {
      return NextResponse.json(
        { error: "Caretaker not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(caretaker, { status: 200 });
  } catch (error) {
    console.error("Error updating caretaker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { caretakerId } = params;

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const caretaker = await Caretaker.findOneAndDelete({
      _id: caretakerId,
      familyProfileId: familyProfile._id,
    });

    if (!caretaker) {
      return NextResponse.json(
        { error: "Caretaker not found" },
        { status: 404 },
      );
    }

    familyProfile.members = familyProfile.members.filter(
      (id) => id.toString() !== caretakerId,
    );
    await familyProfile.save();

    return NextResponse.json(
      { message: "Caretaker deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting caretaker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
