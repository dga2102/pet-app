import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ShoppingItem from "@/models/shoppingItem";
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

    const shoppingItem = new ShoppingItem({
      ...body,
      familyProfileId: familyProfile._id,
    });

    await shoppingItem.save();
    await shoppingItem.populate(["petId", "addedBy", "completedBy"]);

    return NextResponse.json(shoppingItem, { status: 201 });
  } catch (error) {
    console.error("Error creating shopping item:", error);
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

    const { searchParams } = new URL(req.url);
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    const familyProfile = await FamilyProfile.findOne({ clerkId: userId });
    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 },
      );
    }

    let query = { familyProfileId: familyProfile._id };

    if (!includeCompleted) {
      query.isCompleted = false;
    }

    const items = await ShoppingItem.find(query)
      .populate("petId")
      .populate("addedBy")
      .populate("completedBy")
      .sort({ priority: -1, createdAt: -1 });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching shopping items:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
