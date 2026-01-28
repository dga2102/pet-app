"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AcceptInvite() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    acceptInvite();
  }, [token]);

  async function acceptInvite() {
    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.requiresAuth) {
        // Redirect to signup/login with token
        router.push(`/signup?token=${token}&email=${data.email}`);
      } else if (data.success) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <div>
      {status === "loading" && <p>Processing invitation...</p>}
      {status === "success" && <p>Successfully joined household!</p>}
      {status === "error" && <p>Invalid or expired invitation</p>}
    </div>
  );
}
