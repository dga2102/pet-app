import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment";
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

    const appointment = new Appointment({
      ...body,
      familyProfileId: familyProfile._id,
    });

    await appointment.save();
    await appointment.populate(["petId", "assignedTo"]);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = { familyProfileId: familyProfile._id };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await Appointment.find(query)
      .populate("petId")
      .populate("assignedTo")
      .sort({ startDate: 1 });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
