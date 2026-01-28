"use client";

import { createContext, useContext, useEffect, useState } from "react";

const HouseholdContext = createContext(null);

export function HouseholdProvider({ children }) {
  const { user, isLoaded } = useUser();

  const [member, setMember] = useState(null);
  const [household, setHousehold] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadData() {
      setLoading(true);

      // 1. Load household member
      const memberRes = await fetch(
        `/api/household-members?clerkUserId=${user.id}`,
      );

      if (!memberRes.ok) {
        // User has NO household membership yet
        setMember(null);
        setHousehold(null);
        setTasks([]);
        setLoading(false);
        return;
      }

      const memberData = await memberRes.json();
      setMember(memberData);

      // 2. Load household (only if householdId exists)
      if (!memberData.householdId) {
        setHousehold(null);
        setTasks([]);
        setLoading(false);
        return;
      }

      const householdRes = await fetch(
        `/api/households?id=${memberData.householdId}`,
      );

      if (!householdRes.ok) {
        setHousehold(null);
        setTasks([]);
        setLoading(false);
        return;
      }

      const householdData = await householdRes.json();
      setHousehold(householdData);

      // 3. Load tasks (only if member exists)
      const tasksRes = await fetch(`/api/tasks?assignedTo=${memberData._id}`);
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      setTasks(tasksData);

      setLoading(false);
    }

    loadData();
  }, [isLoaded, user]);

  return (
    <HouseholdContext.Provider value={{ member, household, tasks, loading }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
