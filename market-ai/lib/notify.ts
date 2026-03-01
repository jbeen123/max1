export async function sendInviteEmail(params: {
  to: string;
  inviteUrl: string;
  role: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_EMAIL_FROM || "Market AI <no-reply@market.ai>";

  if (!apiKey) {
    return { delivered: false, mode: "disabled", reason: "RESEND_API_KEY missing" } as const;
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `You're invited to market.ai as ${params.role}`,
      html: `<p>You were invited to market.ai as <strong>${params.role}</strong>.</p><p><a href=\"${params.inviteUrl}\">Accept invite</a></p>`,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { delivered: false, mode: "resend", reason: text } as const;
  }

  const data = await resp.json();
  return { delivered: true, mode: "resend", id: data?.id } as const;
}
