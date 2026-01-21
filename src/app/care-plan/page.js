"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import CarePlanTasks from "@/components/CarePlanTasks";

export default function CarePlanPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Care Plan</h1>
        <p className="text-gray-600 mt-2">
          Create and manage daily care tasks and routines for your pets
        </p>
      </div>

      <CarePlanTasks />
    </main>
  );
}
