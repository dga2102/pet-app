"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardCalendar from "@/components/DashboardCalendar";

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <h4 className="text-gray-600 mt-2">
          Manage your pet care schedule and appointments at a glance
        </h4>
      </div>

      <DashboardCalendar />
    </main>
  );
}
