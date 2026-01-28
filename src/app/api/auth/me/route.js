import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import { sessionOptions } from "@/lib/session";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ user: null }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.userId).select("-password");

    if (!user) {
      return Response.json({ user: null }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        householdId: user.householdId,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ user: null }, { status: 500 });
  }
}
