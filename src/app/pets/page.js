"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import PetManagement from "@/components/PetManagement";

export default function PetsPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Pets</h1>
        <p className="text-gray-600 mt-2">
          Manage your pets' profiles, medical records, and health information
        </p>
      </div>

      <PetManagement />
    </main>
  );
}
