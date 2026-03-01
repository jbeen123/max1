"use client";

import { signOut, useSession } from "next-auth/react";

export function AuthStatus() {
  const { data } = useSession();
  const user = data?.user as { email?: string; role?: string } | undefined;

  if (!user?.email) return null;

  return (
    <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
      <span style={{ fontSize: ".9rem", color: "#93c5fd" }}>
        {user.email} {user.role ? `(${user.role})` : ""}
      </span>
      <button
        className="ghost"
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{ width: "auto", padding: ".4rem .7rem" }}
      >
        Logout
      </button>
    </div>
  );
}
