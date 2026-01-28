import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { TaskCompletion } from "@/models/task";
import { sessionOptions } from "@/lib/session";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { taskId, date, isCompleted } = await request.json();

    const user = await User.findById(session.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Parse date to start of day
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (isCompleted) {
      // Mark as complete
      try {
        await TaskCompletion.create({
          taskId,
          date: taskDate,
          completedBy: user._id,
        });
      } catch (error) {
        // If already exists, ignore duplicate error
        if (error.code !== 11000) throw error;
      }
    } else {
      // Mark as incomplete
      await TaskCompletion.deleteOne({
        taskId,
        date: taskDate,
      });
    }

    return Response.json({ success: true, isCompleted });
  } catch (error) {
    console.error("Toggle task completion error:", error);
    return Response.json(
      { error: "Failed to toggle completion" },
      { status: 500 },
    );
  }
}
