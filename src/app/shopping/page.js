"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ShoppingList from "@/components/ShoppingList";

export default function ShoppingPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Shopping List</h1>
        <h4 className="text-gray-600 mt-2">
          Manage pet supplies and groceries on a shared shopping list
        </h4>
      </div>

      <ShoppingList />
    </main>
  );
}
