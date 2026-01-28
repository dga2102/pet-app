import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/user";
import PetTrackPost from "@/models/PetTrackPost";
import { sessionOptions } from "@/lib/session";

export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const { content } = await request.json();

    const user = await User.findById(session.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const post = await PetTrackPost.findById(id);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.householdId.toString() !== user.householdId.toString()) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Add reply
    post.replies.push({
      authorId: session.userId,
      content,
      createdAt: new Date(),
    });

    // Mark post as unread for everyone except the replier
    post.readBy = [session.userId];

    await post.save();

    await post.populate("petId", "name profileImage");
    await post.populate("authorId", "name email");
    await post.populate("resolvedBy", "name");
    await post.populate("replies.authorId", "name email");

    return Response.json(post);
  } catch (error) {
    console.error("Add reply error:", error);
    return Response.json({ error: "Failed to add reply" }, { status: 500 });
  }
}
