import bcrypt from "bcrypt";
import User from "@/models/user";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const { email, password, name } = await req.json();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, passwordHash, name });

    req.session.userId = user._id;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 },
    );
  }
}
