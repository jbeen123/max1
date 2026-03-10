"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/notifications").then((r) => r.json()).catch(() => ({}));
    setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
    setUnreadCount(res.unreadCount ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    await load();
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications/read-all", { method: "POST" }).then((r) => r.json());
    setMsg(`Marked ${res.count} notifications as read`);
    await load();
  }

  const typeIcon: Record<string, string> = {
    OFFER_RECEIVED: "💰",
    OFFER_ACCEPTED: "✅",
    OFFER_REJECTED: "❌",
    OFFER_COUNTERED: "↩️",
    LISTING_APPROVED: "🏡",
    LISTING_REJECTED: "⚠️",
    KYC_VERIFIED: "🪪",
    KYC_REJECTED: "🚫",
    CONTRACT_READY: "📄",
    CONTRACT_SIGNED: "✍️",
    PAYMENT_RECEIVED: "💳",
    PAYMENT_SENT: "💸",
    POLICY_APPROVAL_NEEDED: "🔐",
    SYSTEM: "🔔",
  };

  return (
    <section className="grid" style={{ gap: "1rem", maxWidth: 700, margin: "0 auto" }}>
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>
          Notifications {unreadCount > 0 && (
            <span style={{
              background: "#ef4444", color: "#fff", borderRadius: 999,
              fontSize: ".75rem", padding: "2px 8px", marginLeft: ".5rem",
            }}>{unreadCount}</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button className="ghost" style={{ width: "auto" }} onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {msg && <p style={{ margin: 0, fontSize: ".875rem", color: "#6b7280" }}>{msg}</p>}

      {loading ? <p>Loading…</p> : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#9ca3af" }}>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: ".5rem" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                display: "flex", gap: "1rem", alignItems: "flex-start",
                opacity: n.readAt ? 0.65 : 1,
                background: n.readAt ? undefined : "var(--surface-raised, #f0f9ff)",
                cursor: n.link ? "pointer" : "default",
              }}
              onClick={() => {
                if (!n.readAt) markRead(n.id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{typeIcon[n.type] ?? "🔔"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: ".5rem" }}>
                  <strong style={{ fontSize: ".9rem" }}>{n.title}</strong>
                  <span style={{ fontSize: ".75rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: ".25rem 0 0", fontSize: ".875rem", color: "#4b5563" }}>{n.body}</p>
              </div>
              {!n.readAt && (
                <button
                  className="ghost"
                  style={{ width: "auto", flexShrink: 0, fontSize: ".75rem" }}
                  onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
