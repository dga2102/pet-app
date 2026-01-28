"use client";

import { useState } from "react";

export default function InviteFamilyMember({ householdId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function handleInvite(e) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, householdId }),
    });

    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send Invite
      </button>

      {status === "loading" && <p>Sending invite…</p>}
      {status === "success" && <p>Invite sent!</p>}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}
