"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    }
    load();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">Animal Care App</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium">{user.name}</span>
          <button onClick={logout} className="px-3 py-1 bg-gray-200 rounded">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
