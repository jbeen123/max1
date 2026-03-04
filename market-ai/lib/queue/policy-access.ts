import type { User } from "@prisma/client";

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

export function canRequestQueuePolicy(user: User) {
  const requesterEmails = parseCsv(process.env.QUEUE_POLICY_REQUESTER_EMAILS);
  if (requesterEmails.size === 0) return true;
  return requesterEmails.has(user.email.toLowerCase());
}

export function canApproveQueuePolicy(user: User) {
  const approverEmails = parseCsv(process.env.QUEUE_POLICY_APPROVER_EMAILS);
  const approverDomains = parseCsv(process.env.QUEUE_POLICY_APPROVER_DOMAINS);

  if (approverEmails.size === 0 && approverDomains.size === 0) return true;

  const email = user.email.toLowerCase();
  return approverEmails.has(email) || approverDomains.has(emailDomain(email));
}

export function queuePolicyRoleReason(user: User) {
  const requesterEmails = parseCsv(process.env.QUEUE_POLICY_REQUESTER_EMAILS);
  const approverEmails = parseCsv(process.env.QUEUE_POLICY_APPROVER_EMAILS);
  const approverDomains = parseCsv(process.env.QUEUE_POLICY_APPROVER_DOMAINS);

  const email = user.email.toLowerCase();
  const isRequester = requesterEmails.size === 0 ? true : requesterEmails.has(email);
  const isApprover =
    approverEmails.size === 0 && approverDomains.size === 0
      ? true
      : approverEmails.has(email) || approverDomains.has(emailDomain(email));

  if (isRequester && !isApprover) return "requester_only";
  if (!isRequester && isApprover) return "approver_only";
  if (isRequester && isApprover) return "dual_role";
  return "none";
}
