"use client";

import { useEffect, useState } from "react";

export default function HouseholdMembers({ householdId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/household-members?householdId=${householdId}`,
      );
      const data = await res.json();
      setMembers(data);
    }
    load();
  }, [householdId]);

  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li key={m._id}>
          {m.name} — {m.role}
        </li>
      ))}
    </ul>
  );
}
