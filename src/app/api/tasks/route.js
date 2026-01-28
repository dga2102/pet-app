import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Task, { TaskCompletion } from "@/models/task";
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const petId = searchParams.get("petId");
    const assignedTo = searchParams.get("assignedTo");

    // Build query
    const query = { householdId: user.householdId, isActive: true };

    if (petId) {
      query.petId = petId;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // If date is specified, filter by day of week
    if (date) {
      const dayOfWeek = new Date(date).getDay();
      query.daysOfWeek = dayOfWeek;
    }

    // Get all tasks for this household
    const tasks = await Task.find(query)
      .populate("petId", "name profileImage animal")
      .populate("assignedTo", "name email")
      .sort({ time: 1 });

    // If date is specified, check completion status for that date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const completions = await TaskCompletion.find({
        taskId: { $in: tasks.map((t) => t._id) },
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      const completionMap = {};
      completions.forEach((c) => {
        completionMap[c.taskId.toString()] = true;
      });

      // Add isCompleted field to each task
      const tasksWithCompletion = tasks.map((task) => ({
        ...task.toObject(),
        isCompleted: !!completionMap[task._id.toString()],
      }));

      return Response.json(tasksWithCompletion);
    }

    return Response.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return Response.json({ error: "Failed to get tasks" }, { status: 500 });
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

    const taskData = await request.json();

    // Create new task
    const task = await Task.create({
      ...taskData,
      householdId: user.householdId,
    });

    // Populate before returning
    await task.populate("petId", "name profileImage animal");
    await task.populate("assignedTo", "name email");

    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return Response.json({ error: "Failed to create task" }, { status: 500 });
  }
}
