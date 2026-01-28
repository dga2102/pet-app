"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader,
  ArrowLeft,
  Send,
  Clock,
} from "lucide-react";

export default function PetTrackPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pets, setPets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [formData, setFormData] = useState({
    petId: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user
      const userResponse = await fetch("/api/auth/me");
      const userData = await userResponse.json();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setCurrentUser(userData.user);

      // Check if owner
      const membersResponse = await fetch("/api/household/members");
      const membersData = await membersResponse.json();

      if (membersData.success) {
        const currentMember = membersData.members.find(
          (m) => m.id.toString() === userData.user.id.toString(),
        );
        setIsOwner(currentMember?.role === "owner");
      }

      // Fetch pets
      const petsResponse = await fetch("/api/pets");
      const petsData = await petsResponse.json();
      setPets(Array.isArray(petsData) ? petsData : []);

      // Fetch posts
      const postsResponse = await fetch("/api/pettrack");
      const postsData = await postsResponse.json();
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingPost) {
        response = await fetch(`/api/pettrack/${editingPost._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/pettrack", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchData();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save post"}`);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Error saving post. Please try again.");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({
      petId: "",
      title: "",
      content: "",
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      petId: post.petId._id,
      title: post.title,
      content: post.content,
    });
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/pettrack/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchData();
          if (viewingPost?._id === postId) {
            setViewingPost(null);
          }
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || "Failed to delete post"}`);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleResolve = async (postId, isResolved) => {
    if (!isOwner) {
      alert("Only household owners can resolve posts");
      return;
    }

    try {
      const response = await fetch(`/api/pettrack/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResolved }),
      });

      if (response.ok) {
        await fetchData();
        if (viewingPost?._id === postId) {
          const data = await response.json();
          setViewingPost(data);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to resolve post"}`);
      }
    } catch (error) {
      console.error("Error resolving post:", error);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const response = await fetch(`/api/pettrack/${postId}`);
      const data = await response.json();

      if (response.ok) {
        setViewingPost(data);
        // Refresh posts to update read status
        await fetchData();
      }
    } catch (error) {
      console.error("Error viewing post:", error);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/pettrack/${viewingPost._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setViewingPost(updatedPost);
        setReplyContent("");
        await fetchData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to add reply"}`);
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const isUnread = (post) => {
    return !post.readBy.includes(currentUser?.id);
  };

  const getUnreadCount = () => {
    return posts.filter((post) => !post.isResolved && isUnread(post)).length;
  };

  const activePosts = posts.filter((post) => !post.isResolved);
  const resolvedPosts = posts.filter((post) => post.isResolved);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // Post detail view
  if (viewingPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setViewingPost(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Posts
        </button>

        <div
          className={`rounded-lg shadow-md overflow-hidden ${
            viewingPost.isResolved
              ? "bg-gray-100 border-2 border-gray-300"
              : "bg-white"
          }`}
        >
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1
                  className={`text-3xl font-bold mb-2 ${
                    viewingPost.isResolved ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {viewingPost.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    By <strong>{viewingPost.authorId.name}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(viewingPost.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {viewingPost.authorId._id === currentUser?.id && (
                  <>
                    <button
                      onClick={() => handleEdit(viewingPost)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(viewingPost._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                {isOwner && (
                  <button
                    onClick={() =>
                      handleResolve(viewingPost._id, !viewingPost.isResolved)
                    }
                    className={`p-2 rounded-lg transition ${
                      viewingPost.isResolved
                        ? "text-orange-500 hover:bg-orange-50"
                        : "text-green-500 hover:bg-green-50"
                    }`}
                    title={
                      viewingPost.isResolved
                        ? "Mark as unresolved"
                        : "Mark as resolved"
                    }
                  >
                    {viewingPost.isResolved ? (
                      <XCircle size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Pet Info */}
            <div className="flex items-center gap-3 mb-4">
              {viewingPost.petId?.profileImage ? (
                <img
                  src={viewingPost.petId.profileImage}
                  alt={viewingPost.petId.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  🐾
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {viewingPost.petId?.name}
                </p>
                <p className="text-sm text-gray-600">Pet in question</p>
              </div>
            </div>

            {/* Status Badge */}
            {viewingPost.isResolved && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                <CheckCircle size={16} />
                <span>
                  Resolved by {viewingPost.resolvedBy?.name} on{" "}
                  {new Date(viewingPost.resolvedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="p-6 border-b border-gray-200">
            <p
              className={`whitespace-pre-wrap ${
                viewingPost.isResolved ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {viewingPost.content}
            </p>
          </div>

          {/* Replies */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Replies ({viewingPost.replies.length})
            </h3>

            {viewingPost.replies.length > 0 ? (
              <div className="space-y-4 mb-6">
                {viewingPost.replies.map((reply, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {reply.authorId.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {reply.authorId.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 ml-10">{reply.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No replies yet. Be the first to reply!
              </p>
            )}

            {/* Add Reply Form */}
            <form onSubmit={handleAddReply} className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a Reply
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                placeholder="Write your reply..."
                required
              ></textarea>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <Send size={18} />
                Send Reply
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="componentmw">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PetTrack</h1>
          <p className="text-gray-600 mt-1">
            Track and discuss pet issues with your household
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setFormData({ petId: "", title: "", content: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Active Posts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Active Issues ({activePosts.length})
        </h2>

        {activePosts.length > 0 ? (
          <div className="space-y-3">
            {activePosts.map((post) => (
              <div
                key={post._id}
                onClick={() => handleViewPost(post._id)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className={`text-lg mb-1 ${
                        isUnread(post)
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-700"
                      }`}
                    >
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {post.petId?.profileImage ? (
                          <img
                            src={post.petId.profileImage}
                            alt={post.petId.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <span>🐾</span>
                        )}
                        {post.petId?.name}
                      </span>
                      <span>•</span>
                      <span>By {post.authorId.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {post.replies.length} replies
                      </span>
                    </div>
                  </div>
                  {isUnread(post) && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No active issues. All caught up! 🎉
          </p>
        )}
      </div>

      {/* Resolved Posts */}
      {resolvedPosts.length > 0 && (
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-600 mb-4">
            Resolved Issues ({resolvedPosts.length})
          </h2>

          <div className="space-y-3">
            {resolvedPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => handleViewPost(post._id)}
                className="bg-gray-100 border border-gray-300 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-500 mb-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {post.petId?.profileImage ? (
                          <img
                            src={post.petId.profileImage}
                            alt={post.petId.name}
                            className="w-5 h-5 rounded-full object-cover opacity-60"
                          />
                        ) : (
                          <span>🐾</span>
                        )}
                        {post.petId?.name}
                      </span>
                      <span>•</span>
                      <span>
                        Resolved by {post.resolvedBy?.name || "Admin"}
                      </span>
                    </div>
                  </div>
                  <CheckCircle size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingPost ? "Edit Post" : "New Post"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet *
                  </label>
                  <select
                    name="petId"
                    value={formData.petId}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select a pet</option>
                    {pets.map((pet) => (
                      <option key={pet._id} value={pet._id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Describe the issue in detail..."
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    {editingPost ? "Update Post" : "Create Post"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
