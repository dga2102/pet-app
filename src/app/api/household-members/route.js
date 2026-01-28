import { NextResponse } from "next/server";
import HouseholdMember from "@/models/householdMembers";
import connectDB from "@/lib/db";

// GET /api/household-members
// Supports:
//   - ?householdId=123  → returns array of members
//   - ?clerkUserId=abc → returns single member
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const householdId = searchParams.get("householdId");
  const clerkUserId = searchParams.get("clerkUserId");

  // 1. Fetch all members in a household
  if (householdId) {
    const members = await HouseholdMember.find({ householdId });
    return NextResponse.json(members);
  }

  // 2. Fetch a single member by Clerk user ID
  if (clerkUserId) {
    const member = await HouseholdMember.findOne({ clerkUserId });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  }

  return NextResponse.json(
    { error: "Missing householdId or clerkUserId" },
    { status: 400 },
  );
}

// POST /api/household-members
export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { householdId, clerkUserId, name, role } = body;

  if (!householdId || !clerkUserId || !name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const member = await HouseholdMember.create({
    householdId,
    clerkUserId,
    name,
    role: role || "member",
  });

  return NextResponse.json(member);
}
