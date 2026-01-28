import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import PetTrackPost from "@/models/PetTrackPost";
import { sessionOptions } from "@/lib/session";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get all posts for household
    const posts = await PetTrackPost.find({ householdId: user.householdId })
      .populate("petId", "name profileImage")
      .populate("authorId", "name email")
      .populate("resolvedBy", "name")
      .populate("replies.authorId", "name email")
      .sort({ isResolved: 1, createdAt: -1 }); // Unresolved first, then by date

    return Response.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    return Response.json({ error: "Failed to get posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { petId, title, content } = await request.json();

    // Create new post - author automatically marked as read
    const post = await PetTrackPost.create({
      householdId: user.householdId,
      petId,
      authorId: session.userId,
      title,
      content,
      readBy: [session.userId], // Author has read it
    });

    // Populate before returning
    await post.populate("petId", "name profileImage");
    await post.populate("authorId", "name email");

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
