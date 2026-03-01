import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/submit", "/dashboard", "/deal-room", "/admin"];

const roleRules: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard", roles: ["ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/submit", roles: ["SELLER", "ADMIN"] },
  { prefix: "/deal-room", roles: ["BUYER", "SELLER", "ADMIN"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });
  const legacyCookie = req.cookies.get("market_ai_uid")?.value;

  if (!token?.uid && !legacyCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const rule = roleRules.find((r) => pathname.startsWith(r.prefix));
  if (rule && token?.role && !rule.roles.includes(String(token.role))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/submit/:path*", "/dashboard/:path*", "/deal-room/:path*", "/admin/:path*"],
};
