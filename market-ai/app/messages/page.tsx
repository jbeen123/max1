"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  propertyId: string | null;
  updatedAt: string;
  participants: { id: string; userId: string }[];
  messages: Message[];
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  async function loadConversations() {
    setLoading(true);
    const [convRes, meRes] = await Promise.all([
      fetch("/api/conversations").then((r) => r.json()).catch(() => ({})),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
    ]);
    setConversations(Array.isArray(convRes.conversations) ? convRes.conversations : []);
    setMyUserId(meRes?.user?.id ?? null);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const res = await fetch(`/api/conversations/${convId}/messages`).then((r) => r.json()).catch(() => ({}));
    const msgs: Message[] = Array.isArray(res.messages) ? res.messages : [];
    setMessages(msgs.reverse()); // oldest first
  }

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  async function sendMsg() {
    if (!activeId || !draft.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft.trim() }),
    });
    if (res.ok) {
      setDraft("");
      await loadMessages(activeId);
    }
    setSending(false);
  }

  const activeConv = conversations.find((c) => c.id === activeId);
  const otherParticipantId = activeConv?.participants.find((p) => p.userId !== myUserId)?.userId;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "calc(100vh - 120px)", gap: "1rem" }}>

      {/* ── Sidebar ── */}
      <div className="card" style={{ padding: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0 }}>Messages</h3>
        </div>
        {loading ? <p style={{ padding: "1rem" }}>Loading…</p> : conversations.length === 0 ? (
          <p style={{ padding: "1rem", color: "#9ca3af", fontSize: ".875rem" }}>No conversations yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {conversations.map((c) => {
              const lastMsg = c.messages[0];
              const isActive = c.id === activeId;
              return (
                <li
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  style={{
                    padding: ".75rem 1rem",
                    cursor: "pointer",
                    background: isActive ? "#eff6ff" : undefined,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ fontSize: ".875rem", fontWeight: 600 }}>
                    {c.propertyId ? `Property: ${c.propertyId.slice(0, 8)}…` : "Direct message"}
                  </div>
                  {lastMsg && (
                    <div style={{ fontSize: ".75rem", color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg.body}
                    </div>
                  )}
                  <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 2 }}>
                    {new Date(c.updatedAt).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Thread ── */}
      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        {!activeId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            Select a conversation
          </div>
        ) : (
          <>
            <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
              <strong>{activeConv?.propertyId ? `Re: Property ${activeConv.propertyId.slice(0, 8)}…` : "Direct message"}</strong>
              {otherParticipantId && (
                <span style={{ fontSize: ".75rem", color: "#6b7280", marginLeft: ".5rem" }}>{otherParticipantId.slice(0, 8)}…</span>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
              {messages.map((m) => {
                const isMe = m.senderId === myUserId;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "70%", padding: ".5rem .75rem", borderRadius: 12,
                      background: isMe ? "#2563eb" : "#f3f4f6",
                      color: isMe ? "#fff" : "#111827",
                      fontSize: ".875rem",
                    }}>
                      {m.body}
                      <div style={{ fontSize: ".7rem", opacity: 0.7, marginTop: 2, textAlign: isMe ? "right" : "left" }}>
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: ".5rem" }}>
              <input
                style={{ flex: 1 }}
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
                disabled={sending}
              />
              <button style={{ width: "auto" }} onClick={sendMsg} disabled={sending || !draft.trim()}>
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
