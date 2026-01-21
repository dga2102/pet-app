import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment";
import FamilyProfile from "@/models/familyProfile";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { appointmentId } = params;

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      familyProfileId: familyProfile._id,
    })
      .populate("petId")
      .populate("assignedTo");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointment:", error);
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

    const { appointmentId } = params;
    const body = await req.json();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, familyProfileId: familyProfile._id },
      body,
      { new: true },
    )
      .populate("petId")
      .populate("assignedTo");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("Error updating appointment:", error);
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

    const { appointmentId } = params;

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      familyProfileId: familyProfile._id,
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
