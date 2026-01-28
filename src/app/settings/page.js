"use client";

import InviteFamilyMember from "@/components/InviteFamilyMember";
import { useHousehold } from "@/app/context/HouseholdContext";
import HouseholdMembers from "@/components/HouseholdMembers";

export default function SettingsPage() {
  const { household, member, loading } = useHousehold();

  if (loading) return <p className="p-8">Loading…</p>;

  // Handle users with no household yet
  if (!household) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Household Settings</h1>
        <p>You are not part of a household yet.</p>
        <p>If you followed an invite link, try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Household Settings</h1>

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Household Info</h2>
        <p>
          <strong>Name:</strong> {household.name}
        </p>
        <p>
          <strong>Created By:</strong> {household.createdBy}
        </p>
      </section>

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Household Members</h2>
        <HouseholdMembers householdId={household._id} />
      </section>

      {member?.role === "admin" && (
        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Invite a Family Member</h2>
          <InviteFamilyMember householdId={household._id} />
        </section>
      )}

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Your Role</h2>
        <p>{member?.role}</p>
      </section>
    </div>
  );
}
