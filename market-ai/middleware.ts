import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/submit", "/dashboard", "/deal-room"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get("market_ai_uid")?.value;
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/submit/:path*", "/dashboard/:path*", "/deal-room/:path*"],
};
