export function isEdgeTrusted(req: Request) {
  const expected = process.env.EDGE_SHARED_SECRET;
  if (!expected) return false;
  const provided = req.headers.get("x-edge-secret");
  return !!provided && provided === expected;
}
