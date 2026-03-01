export async function uploadAttestationOffbox(payload: unknown) {
  const url = process.env.OFFBOX_ATTESTATION_URL;
  const token = process.env.OFFBOX_ATTESTATION_TOKEN;

  if (!url) {
    return { uploaded: false, mode: "disabled", reason: "OFFBOX_ATTESTATION_URL missing" } as const;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return { uploaded: false, mode: "http", reason: text } as const;
  }

  return { uploaded: true, mode: "http" } as const;
}
