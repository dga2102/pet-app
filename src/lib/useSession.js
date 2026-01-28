export function useSession() {
  const userId =
    typeof window !== "undefined"
      ? document.cookie.includes("connect.sid")
      : null;

  return { userId, isSignedIn: !!userId };
}
