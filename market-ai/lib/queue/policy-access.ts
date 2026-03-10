import type { User } from "@prisma/client";
import { db } from "@/lib/db";

function parseCsv(raw: string | undefined) {
  return new Set(
    (raw || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean),
  );
}

function emailDomain(email: string) {
  const idx = email.lastIndexOf("@");
  return idx === -1 ? "" : email.slice(idx + 1).toLowerCase();
}

// ── DB-backed team check ──────────────────────────────────────────────────

async function getMembersForRole(role: "REQUESTER" | "APPROVER") {
  const teams = await db.policyTeam.findMany({
    where: { role },
    include: { members: true },
  });
  const emails = new Set<string>();
  const domains = new Set<string>();
  for (const team of teams) {
    for (const m of team.members) {
      if (m.email) emails.add(m.email.toLowerCase());
      if (m.domain) domains.add(m.domain.toLowerCase());
    }
  }
  return { emails, domains };
}

// ── Public API ────────────────────────────────────────────────────────────

export async function canRequestQueuePolicy(user: User): Promise<boolean> {
  // Try DB teams first
  const { emails: dbEmails } = await getMembersForRole("REQUESTER");
  if (dbEmails.size > 0) {
    return dbEmails.has(user.email.toLowerCase());
  }

  // Fall back to env
  const requesterEmails = parseCsv(process.env.QUEUE_POLICY_REQUESTER_EMAILS);
  if (requesterEmails.size === 0) return true;
  return requesterEmails.has(user.email.toLowerCase());
}

export async function canApproveQueuePolicy(user: User): Promise<boolean> {
  // Try DB teams first
  const { emails: dbEmails, domains: dbDomains } = await getMembersForRole("APPROVER");
  if (dbEmails.size > 0 || dbDomains.size > 0) {
    const email = user.email.toLowerCase();
    return dbEmails.has(email) || dbDomains.has(emailDomain(email));
  }

  // Fall back to env
  const approverEmails = parseCsv(process.env.QUEUE_POLICY_APPROVER_EMAILS);
  const approverDomains = parseCsv(process.env.QUEUE_POLICY_APPROVER_DOMAINS);
  if (approverEmails.size === 0 && approverDomains.size === 0) return true;
  const email = user.email.toLowerCase();
  return approverEmails.has(email) || approverDomains.has(emailDomain(email));
}

export async function queuePolicyRoleReason(user: User) {
  const [isRequester, isApprover] = await Promise.all([
    canRequestQueuePolicy(user),
    canApproveQueuePolicy(user),
  ]);
  if (isRequester && !isApprover) return "requester_only";
  if (!isRequester && isApprover) return "approver_only";
  if (isRequester && isApprover) return "dual_role";
  return "none";
}
