"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function setup() {
      const email = user.primaryEmailAddress.emailAddress;

      // 0. Check if this user was invited
      const inviteRes = await fetch(`/api/pending-invite?email=${email}`);

      if (inviteRes.ok) {
        // User was invited → skip household creation
        router.push("/accept-invite");
        return;
      }

      // 1. Create household
      const householdRes = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${user.firstName}'s Household`,
          createdBy: user.id,
        }),
      });

      const household = await householdRes.json();

      // 2. Create household member record
      await fetch("/api/household-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: household._id,
          clerkUserId: user.id,
          name: user.firstName,
          role: "admin",
        }),
      });

      // 3. Redirect to dashboard
      router.push("/dashboard");
    }

    setup();
  }, [isLoaded, user, router]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Setting up your household…</h1>
    </div>
  );
}
