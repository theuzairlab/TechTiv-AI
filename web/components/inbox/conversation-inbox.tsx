"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatDateTime } from "@/lib/format-display";
import { cn } from "@/lib/utils";
import type {
  ConversationInboxScope,
  ConversationListItem,
  ConversationMessage,
} from "@/lib/conversations";

function notifyUnreadChanged() {
  window.dispatchEvent(new Event("inbox-unread-changed"));
}

type ConversationInboxProps = {
  initialConversations: ConversationListItem[];
  viewerUserId: string;
  emptyLabel: string;
  allowComposeNew?: boolean;
  inboxScope?: ConversationInboxScope;
};

export function ConversationInbox({
  initialConversations,
  viewerUserId,
  emptyLabel,
  allowComposeNew = false,
  inboxScope = "own",
}: ConversationInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [newThreadDraft, setNewThreadDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const autoOpenedRef = useRef(false);

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const loadThread = useCallback(async (id: string, options?: { markRead?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${id}/messages`);
      const payload = (await response.json()) as {
        messages?: ConversationMessage[];
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "Failed to load thread");
      setMessages(payload.messages ?? []);
      setConversations((prev) =>
        prev.map((item) =>
          item.id === id && item.unreadCount > 0
            ? { ...item, unreadCount: 0 }
            : item,
        ),
      );
      if (options?.markRead !== false) {
        notifyUnreadChanged();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshList = useCallback(async () => {
    const response = await fetch(`/api/conversations?scope=${inboxScope}`);
    if (!response.ok) return;
    const payload = (await response.json()) as {
      conversations: ConversationListItem[];
    };
    setConversations(payload.conversations);
  }, [inboxScope]);

  useEffect(() => {
    if (selectedId || autoOpenedRef.current) return;
    const unread = conversations.find((item) => item.unreadCount > 0);
    const onlyThread = conversations.length === 1 ? conversations[0] : null;
    const target = unread ?? onlyThread;
    if (!target) return;
    autoOpenedRef.current = true;
    router.replace(`?id=${target.id}`);
  }, [conversations, selectedId, router]);

  useEffect(() => {
    if (!selectedId) return;
    const timer = window.setTimeout(() => {
      void loadThread(selectedId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedId, loadThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshList();
      if (selectedId) void loadThread(selectedId, { markRead: false });
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [refreshList, loadThread, selectedId]);

  async function send(conversationId: string, body: string) {
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await response.json()) as {
        message?: ConversationMessage;
        error?: string;
      };
      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "Send failed");
      }
      setMessages((prev) => [...prev, payload.message!]);
      setDraft("");
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function startThread() {
    const body = newThreadDraft.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Could not start conversation");
      }
      setNewThreadDraft("");
      router.push(`?id=${payload.id}`);
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start conversation");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <GlassPanel className="p-0">
        <div className="border-b border-border-subtle px-4 py-3">
          <p className="text-sm font-semibold text-text-primary">Threads</p>
        </div>
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">{emptyLabel}</p>
        ) : (
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border-subtle/60">
            {conversations.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => router.push(`?id=${item.id}`)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    selectedId === item.id
                      ? "bg-brand-cyan/10"
                      : "hover:bg-bg-secondary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {item.userId === viewerUserId ? "TechTivAI" : item.userName}
                    </p>
                    {item.unreadCount > 0 ? (
                      <span className="rounded-full bg-brand-cyan px-1.5 text-[10px] font-bold text-on-accent">
                        {item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-text-muted">
                    {item.lastMessagePreview ?? "No messages yet"}
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatDateTime(item.lastMessageAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      <GlassPanel className="flex min-h-[28rem] flex-col p-0">
        {!selectedId ? (
          <div className="flex flex-1 flex-col justify-center gap-4 p-6">
            <p className="text-center text-sm text-text-muted">
              {allowComposeNew
                ? "Start a conversation with TechTivAI, or open an existing thread."
                : "Select a thread, or message a client from their 360 profile."}
            </p>
            {allowComposeNew ? (
              <div className="mx-auto w-full max-w-lg space-y-3">
                <textarea
                  value={newThreadDraft}
                  onChange={(event) => setNewThreadDraft(event.target.value)}
                  rows={4}
                  placeholder="Ask about your blueprint, a service request, or next steps…"
                  className="w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-3 text-sm text-text-primary"
                />
                <Button
                  type="button"
                  onClick={() => void startThread()}
                  disabled={sending || !newThreadDraft.trim()}
                >
                  Send message
                </Button>
              </div>
            ) : null}
          </div>
        ) : !selected ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-center text-sm text-text-muted">
              Thread not found. Select another conversation.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-border-subtle px-5 py-3">
              <p className="font-medium text-text-primary">
                {selected.userId === viewerUserId ? "TechTivAI" : selected.userName}
              </p>
              <p className="text-xs text-text-muted">
                {selected.userId === viewerUserId
                  ? "Your TechTivAI account team"
                  : selected.userEmail}
                {selected.companyName ? ` · ${selected.companyName}` : ""}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {loading && messages.length === 0 ? (
                <p className="text-sm text-text-muted">Loading…</p>
              ) : (
                messages.map((message) => {
                  const mine = message.senderUserId === viewerUserId;
                  return (
                    <div
                      key={message.id}
                      className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", mine
                        ? "ml-auto bg-brand-cyan/15 text-text-primary"
                        : "bg-bg-secondary/70 text-text-primary")}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        {mine ? "You" : message.senderName}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
            <form
              className="border-t border-border-subtle p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (draft.trim() && selectedId) void send(selectedId, draft);
              }}
            >
              {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  placeholder="Write a message…"
                  className="flex-1 rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-2 text-sm text-text-primary"
                />
                <Button type="submit" disabled={sending || !draft.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </>
        )}
      </GlassPanel>
    </div>
  );
}
