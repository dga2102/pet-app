import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Appointment from "@/models/appointment";
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const petId = searchParams.get("petId");
    const assignedTo = searchParams.get("assignedTo");

    // Build query
    const query = { householdId: user.householdId };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (petId) {
      query.petId = petId;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get all appointments for this household
    const appointments = await Appointment.find(query)
      .populate("petId", "name profileImage")
      .populate("assignedTo", "name email")
      .sort({ startDate: 1 });

    return Response.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    return Response.json(
      { error: "Failed to get appointments" },
      { status: 500 },
    );
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

    const appointmentData = await request.json();

    // Create new appointment
    const appointment = await Appointment.create({
      ...appointmentData,
      householdId: user.householdId,
    });

    // Populate before returning
    await appointment.populate("petId", "name profileImage");
    await appointment.populate("assignedTo", "name email");

    return Response.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return Response.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
