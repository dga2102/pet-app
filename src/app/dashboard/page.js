"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [editingHouseholdName, setEditingHouseholdName] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user info
      const userResponse = await fetch("/api/auth/me");
      const userData = await userResponse.json();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setUser(userData.user);

      // Fetch household info
      const householdResponse = await fetch("/api/household");
      const householdData = await householdResponse.json();

      if (householdData.success) {
        setHousehold(householdData.household);
        setNewHouseholdName(householdData.household.name);
      }

      // Fetch household members
      const membersResponse = await fetch("/api/household/members");
      const membersData = await membersResponse.json();

      if (membersData.success) {
        setMembers(membersData.members);

        // Check if current user is owner
        const currentUserMember = membersData.members.find(
          (m) => m.id.toString() === userData.user.id.toString(),
        );
        setIsOwner(currentUserMember?.role === "owner");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteMessage("");

    try {
      const response = await fetch("/api/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setInviteMessage("✅ Invitation sent successfully!");
        setInviteEmail("");
      } else {
        setInviteMessage("❌ " + data.error);
      }
    } catch (error) {
      setInviteMessage("❌ Failed to send invitation");
    }
  };

  const handleUpdateHouseholdName = async () => {
    if (!newHouseholdName.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/household", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newHouseholdName }),
      });

      const data = await response.json();

      if (data.success) {
        setHousehold(data.household);
        setEditingHouseholdName(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to update household name");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px 0" }}>Dashboard</h1>
            <p style={{ margin: 0, color: "#666" }}>
              Welcome,{" "}
              <a
                href="/profile"
                style={{
                  color: "#0070f3",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {user?.name}
              </a>
              !
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>

        {/* Household Info */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {editingHouseholdName ? (
              <>
                <input
                  type="text"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                    flex: 1,
                  }}
                />
                <button
                  onClick={handleUpdateHouseholdName}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingHouseholdName(false);
                    setNewHouseholdName(household?.name || "");
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0 }}>
                  {household?.name || "Your Household"}
                </h2>
                {isOwner && (
                  <button
                    onClick={() => setEditingHouseholdName(true)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Edit Name
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Household Members */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Household Members ({members.length})</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#0070f3",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: "500", fontSize: "16px" }}>
                        {member.name}
                        {member.id.toString() === user.id.toString() && (
                          <span
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginLeft: "8px",
                            }}
                          >
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        {member.email}
                      </div>
                      {member.phone && (
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      backgroundColor:
                        member.role === "owner" ? "#ffc107" : "#6c757d",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      marginBottom: "4px",
                    }}
                  >
                    {member.role}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    Joined {formatDate(member.joinedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Card */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Invite Someone</h2>
          <form onSubmit={handleSendInvite}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Send Invitation
            </button>
          </form>

          {inviteMessage && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: inviteMessage.includes("✅")
                  ? "#d4edda"
                  : "#f8d7da",
                color: inviteMessage.includes("✅") ? "#155724" : "#721c24",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {inviteMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { redirect } from "next/navigation";
// import DashboardCalendar from "@/components/DashboardCalendar";

// export default function Dashboard() {
//   const { isLoaded, userId } = useAuth();

//   if (!isLoaded || !userId) {
//     return redirect("/");
//   }

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
//         <h4 className="text-gray-600 mt-2">
//           Manage your pet care schedule and appointments at a glance
//         </h4>
//       </div>

//       <DashboardCalendar />
//     </main>
//   );
// }
