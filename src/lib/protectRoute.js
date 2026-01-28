import { redirect } from "next/navigation";

export function protectRoute(req) {
  const userId = req?.session?.userId;

  if (!userId) {
    redirect("/login");
  }

  return userId;
}
