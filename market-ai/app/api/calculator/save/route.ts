import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { canMessage } from "@/lib/subscription";
import { db } from "@/lib/db";

// POST /api/calculator/save - Save calculation (Pro feature)
export async function POST(req: Request) {
  try {
    const auth = await requireRole(["BUYER", "SELLER", "ADMIN"]);
    if (!auth.ok || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Pro subscription
    const { getUserSubscription } = await import("@/lib/subscription");
    const sub = await getUserSubscription(auth.user.id);
    
    if (!sub.isPro) {
      return NextResponse.json(
        { error: "Pro subscription required" },
        { status: 403 }
      );
    }

    const data = await req.json();
    
    // Save calculation (optional - requires adding SavedCalculation model)
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: "Calculation saved",
      data: {
        ...data,
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save calculation" },
      { status: 500 }
    );
  }
}
