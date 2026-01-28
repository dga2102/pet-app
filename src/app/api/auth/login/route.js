import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sessionOptions } from "@/lib/session";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check password
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    session.userId = user._id.toString();
    await session.save();

    return Response.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        householdId: user.householdId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Failed to login" }, { status: 500 });
  }
}
