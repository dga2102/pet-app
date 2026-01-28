"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ChevronRight } from "lucide-react";

export default function PetTrackWidget() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const [userResponse, postsResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/pettrack"),
      ]);

      const userData = await userResponse.json();
      const postsData = await postsResponse.json();

      if (userData.user && Array.isArray(postsData)) {
        // Count unread active posts
        const unread = postsData.filter(
          (post) => !post.isResolved && !post.readBy.includes(userData.user.id),
        ).length;

        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => router.push("/pettrack")}
      className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <MessageSquare className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-white">PetTrack</h3>
        </div>
        <ChevronRight className="text-white opacity-70" size={24} />
      </div>

      {loading ? (
        <p className="text-white text-opacity-90">Loading...</p>
      ) : unreadCount > 0 ? (
        <div>
          <p className="text-white text-lg font-semibold">
            {unreadCount} new {unreadCount === 1 ? "post" : "posts"}
          </p>
          <p className="text-white text-opacity-90 text-sm">
            Click to view unread issues
          </p>
        </div>
      ) : (
        <p className="text-white text-opacity-90">All caught up!</p>
      )}
    </div>
  );
}
