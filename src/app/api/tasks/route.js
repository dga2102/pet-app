import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DailyTask from "@/models/dailyTask";
import TaskInstance from "@/models/taskInstance";
import FamilyProfile from "@/models/familyProfile";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const dailyTask = new DailyTask({
      ...body,
      familyProfileId: familyProfile._id,
    });

    await dailyTask.save();
    await dailyTask.populate(["petId", "assignedTo"]);

    return NextResponse.json(dailyTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
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

    const tasks = await DailyTask.find({ familyProfileId: familyProfile._id })
      .populate("petId")
      .populate("assignedTo")
      .sort({ time: 1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
