import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import Appointment from "@/models/appointment";
import HouseholdMember from "@/models/householdMembers";
import { sessionOptions } from "@/lib/session";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find appointment and verify it belongs to user's household
    const appointment = await Appointment.findById(id)
      .populate("petId", "name profileImage animal breed")
      .populate("assignedTo", "name email phone");

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    return Response.json(
      { error: "Failed to get appointment" },
      { status: 500 },
    );
  }
}

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

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Find appointment and verify it belongs to user's household
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    )
      .populate("petId", "name profileImage")
      .populate("assignedTo", "name email");

    return Response.json(updatedAppointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    return Response.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
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

    // Get current user
    const user = await User.findById(session.userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is household owner (only owners can delete)
    const membership = await HouseholdMember.findOne({
      householdId: user.householdId,
      userId: user._id,
    });

    if (!membership || membership.role !== "owner") {
      return Response.json(
        { error: "Only household owners can delete appointments" },
        { status: 403 },
      );
    }

    // Find appointment and verify it belongs to user's household
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete appointment
    await Appointment.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return Response.json(
      { error: "Failed to delete appointment" },
      { status: 500 },
    );
  }
}
