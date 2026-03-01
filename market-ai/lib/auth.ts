import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

export const AUTH_COOKIE = "market_ai_uid";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get(AUTH_COOKIE)?.value;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    return { ok: false as const, user: null };
  }
  return { ok: true as const, user };
}
