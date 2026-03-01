export function ComplianceBadge({ state, assignmentAllowed }: { state: string; assignmentAllowed: boolean }) {
  const label = assignmentAllowed
    ? `Assignment flagged for review in ${state}`
    : `Direct sale flow in ${state}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".5rem",
        border: "1px solid #3b82f6",
        borderRadius: 999,
        padding: ".35rem .7rem",
        fontSize: ".85rem",
      }}
    >
      <span>⚖️</span>
      <span>{label}</span>
    </div>
  );
}
