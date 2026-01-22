"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AppointmentScheduler from "@/components/AppointmentScheduler";

export default function AppointmentsPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Appointments</h1>
        <h4 className="text-gray-600 mt-2">
          Schedule and manage vet, grooming, and other pet appointments
        </h4>
      </div>

      <AppointmentScheduler />
    </main>
  );
}
