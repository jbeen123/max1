import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require Pro subscription
const PROTECTED_ROUTES = [
  "/messages",
  "/api/conversations",
  "/api/conversations/",
  "/dashboard/create",
];

// Routes that are free for everyone
const PUBLIC_ROUTES = [
  "/search",
  "/property/",
  "/login",
  "/pricing",
  "/api/auth",
  "/api/properties", // GET only - listing viewing
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({ req: request });
  
  if (!token) {
    // Redirect to login if not authenticated
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check if route requires Pro subscription
  const requiresPro = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (requiresPro) {
    // Check subscription status via API
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/subscription/status`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to check subscription");
      }
      
      const { isPro } = await response.json();
      
      if (!isPro) {
        // Redirect to pricing page
        const url = new URL("/pricing", request.url);
        url.searchParams.set("reason", "subscription_required");
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Subscription check failed:", error);
      // Allow access on error to prevent lockouts
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/messages/:path*",
    "/admin/:path*",
    "/api/conversations/:path*",
    "/api/admin/:path*",
    "/submit",
  ],
};
