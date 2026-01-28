import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Task from "@/models/task";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

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

    const user = await User.findById(session.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const task = await Task.findById(id);
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("petId", "name profileImage animal")
      .populate("assignedTo", "name email");

    return Response.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return Response.json({ error: "Failed to update task" }, { status: 500 });
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
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is household owner
    const membership = await HouseholdMember.findOne({
      householdId: user.householdId,
      userId: user._id,
    });

    if (!membership || membership.role !== "owner") {
      return Response.json(
        { error: "Only household owners can delete tasks" },
        { status: 403 },
      );
    }

    const task = await Task.findById(id);
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Task.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return Response.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
