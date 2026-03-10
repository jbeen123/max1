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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
    setUnreadCount(data.unreadCount || 0);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    load();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.25rem",
          position: "relative",
          padding: "4px 8px",
        }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#dc2626",
              color: "#fff",
              borderRadius: "999px",
              fontSize: ".65rem",
              fontWeight: 700,
              padding: "1px 5px",
              minWidth: "16px",
              textAlign: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,.12)",
            zIndex: 999,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".75rem 1rem", borderBottom: "1px solid #f3f4f6" }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: ".8rem" }}>
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}>No notifications</p>
          ) : (
            items.slice(0, 20).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.readAt) markRead(n.id);
                  if (n.link) window.location.href = n.link;
                }}
                style={{
                  padding: ".75rem 1rem",
                  borderBottom: "1px solid #f9fafb",
                  cursor: n.link ? "pointer" : "default",
                  background: n.readAt ? "transparent" : "#eff6ff",
                }}
              >
                <div style={{ fontWeight: n.readAt ? 400 : 600, fontSize: ".875rem" }}>{n.title}</div>
                <div style={{ fontSize: ".8rem", color: "#6b7280", marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
