import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { sendQueueAlert } from "@/lib/alerts/queue-alert";

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const webhookUrl = searchParams.get("url") || process.env.QUEUE_ALERT_WEBHOOK_URL || "";

  if (!webhookUrl) {
    return NextResponse.json({ ok: false, reason: "no_webhook_url_configured" });
  }

  const start = Date.now();
  const result = await sendQueueAlert({
    queueKey: "HEALTH_CHECK",
    message: "market.ai webhook health check ping",
    webhookUrl,
  });
  const latencyMs = Date.now() - start;

  return NextResponse.json({
    ok: result.sent,
    latencyMs,
    webhookUrl,
    ...result,
  });
}
