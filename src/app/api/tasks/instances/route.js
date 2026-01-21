import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TaskInstance from "@/models/taskInstance";
import FamilyProfile from "@/models/familyProfile";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    let query = { familyProfileId: familyProfile._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const instances = await TaskInstance.find(query)
      .populate("dailyTaskId")
      .populate("petId")
      .populate("assignedTo")
      .populate("completedBy")
      .sort({ time: 1 });

    return NextResponse.json(instances, { status: 200 });
  } catch (error) {
    console.error("Error fetching task instances:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const taskInstance = new TaskInstance({
      ...body,
      familyProfileId: familyProfile._id,
    });

    await taskInstance.save();
    await taskInstance.populate(["dailyTaskId", "petId", "assignedTo"]);

    return NextResponse.json(taskInstance, { status: 201 });
  } catch (error) {
    console.error("Error creating task instance:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
