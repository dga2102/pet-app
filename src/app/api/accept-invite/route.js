import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PendingInvite from "@/models/pendingInvite";
import HouseholdMember from "@/models/householdMembers";

export async function POST(req) {
  await connectDB();

  const { token } = await req.json();
  const userId = req.session.userId;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const invite = await PendingInvite.findOne({ token });

  if (!invite || invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 400 },
    );
  }

  await HouseholdMember.create({
    householdId: invite.householdId,
    userId,
    role: "member",
  });

  await PendingInvite.deleteOne({ token });

  return NextResponse.json({ success: true });
}
