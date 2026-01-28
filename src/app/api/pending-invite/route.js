import { NextResponse } from "next/server";
import PendingInvite from "@/models/pendingInvite";
import connectDB from "@/lib/db";

// GET /api/pending-invite?email=someone@example.com
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const invite = await PendingInvite.findOne({ email });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  return NextResponse.json(invite);
}

// DELETE /api/pending-invite?id=xxxx
export async function DELETE(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing invite ID" }, { status: 400 });
  }

  await PendingInvite.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
