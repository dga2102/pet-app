import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ShoppingItem from "@/models/shoppingItem";
import FamilyProfile from "@/models/familyProfile";

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { itemId } = params;
    const body = await req.json();

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const shoppingItem = await ShoppingItem.findOneAndUpdate(
      { _id: itemId, familyProfileId: familyProfile._id },
      body,
      { new: true },
    ).populate(["petId", "addedBy", "completedBy"]);

    if (!shoppingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(shoppingItem, { status: 200 });
  } catch (error) {
    console.error("Error updating shopping item:", error);
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

    const { itemId } = params;

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    const shoppingItem = await ShoppingItem.findOneAndDelete({
      _id: itemId,
      familyProfileId: familyProfile._id,
    });

    if (!shoppingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Shopping item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting shopping item:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
