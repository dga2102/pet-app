import User from "@/models/user";
import connectDB from "@/lib/db";

export async function currentUser(req) {
  await connectDB();

  const userId = req?.session?.userId;
  if (!userId) return null;

  return await User.findById(userId).lean();
}
