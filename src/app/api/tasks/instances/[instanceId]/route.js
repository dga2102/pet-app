import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TaskInstance from "@/models/taskInstance";
import FamilyProfile from "@/models/familyProfile";

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { instanceId } = params;
    const body = await req.json();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const taskInstance = await TaskInstance.findOneAndUpdate(
      { _id: instanceId, familyProfileId: familyProfile._id },
      body,
      { new: true },
    ).populate(["dailyTaskId", "petId", "assignedTo", "completedBy"]);

    if (!taskInstance) {
      return NextResponse.json(
        { error: "Task instance not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(taskInstance, { status: 200 });
  } catch (error) {
    console.error("Error updating task instance:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
