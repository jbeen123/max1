import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { sendQueueAlert } from "@/lib/alerts/queue-alert";

const schema = z.object({
  queueKey: z.string().default("ATTESTATION_UPLOAD"),
  message: z.string().min(1).default("Manual test alert"),
  webhookUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const input = schema.parse(await req.json());
  const sent = await sendQueueAlert({ queueKey: input.queueKey, message: input.message, webhookUrl: input.webhookUrl });

  return NextResponse.json({ ok: true, sent });
}
