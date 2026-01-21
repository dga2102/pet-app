import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pet from "@/models/pet";
import FamilyProfile from "@/models/familyProfile";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { name, animal, breed, age, weight, dateOfBirth } = body;

    let familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      // Create default family profile if it doesn't exist
      familyProfile = new FamilyProfile({
        clerkId: userId,
        familyName: "My Family",
        primaryContact: { name: "Primary Contact" },
      });
      await familyProfile.save();
    }

    const pet = new Pet({
      familyProfileId: familyProfile._id,
      name,
      animal,
      breed,
      age,
      weight,
      dateOfBirth,
    });

    await pet.save();

    familyProfile.pets.push(pet._id);
    await familyProfile.save();

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error("Error creating pet:", error);
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

    const pets = await Pet.find({ familyProfileId: familyProfile._id });

    return NextResponse.json(pets, { status: 200 });
  } catch (error) {
    console.error("Error fetching pets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
