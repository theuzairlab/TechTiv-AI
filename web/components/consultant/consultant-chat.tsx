"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Search, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  toolName?: string | null;
};

type ConsultantChatProps = {
  analysisId: string;
  hideComposer?: boolean;
};

export function ConsultantChat({ analysisId, hideComposer = false }: ConsultantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(
        `/api/consultant/messages?analysisId=${encodeURIComponent(analysisId)}`,
      );
      const payload = (await response.json()) as { messages?: ChatMessage[] };
      if (!cancelled) setMessages(payload.messages ?? []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  async function send() {
    const message = draft.trim();
    if (!message || loading) return;
    setDraft("");
    setError(null);
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content: message },
    ]);

    try {
      const response = await fetch("/api/consultant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, message }),
      });
      const payload = (await response.json()) as {
        reply?: string;
        research?: Array<{ tool: string; query: string; ok: boolean }>;
        error?: string;
      };
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "Consultant failed");
      }
      const researchNotes = (payload.research ?? []).map((item, index) => ({
        id: `tool-${Date.now()}-${index}`,
        role: "tool",
        content: item.ok ? `Looked up: ${item.query}` : `Lookup failed: ${item.query}`,
        toolName: item.tool,
      }));
      setMessages((prev) => [
        ...prev,
        ...researchNotes,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.reply!,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Consultant failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col", hideComposer ? "min-h-[22rem]" : "min-h-[32rem]")}>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">
            Ask about the blueprint, stack, timeline, or what to implement first.
            I’ll research the web when I need live facts.
          </p>
        ) : (
          messages.map((message) => {
            if (message.role === "tool") {
              return (
                <div
                  key={message.id}
                  className="flex items-center gap-2 text-xs text-brand-cyan"
                >
                  <Search size={12} />
                  {message.content}
                </div>
              );
            }
            const mine = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                  mine
                    ? "ml-auto bg-brand-cyan/15 text-text-primary"
                    : "bg-bg-secondary/70 text-text-primary",
                )}
              >
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {mine ? <User size={12} /> : <Bot size={12} />}
                  {mine ? "You" : "TivAI"}
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            );
          })
        )}
        {loading ? (
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 size={14} className="animate-spin" />
            Thinking — may search Tavily / Google if needed…
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

        {hideComposer ? null : (
          <form
            className="mt-4 border-t border-border-subtle pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder="Ask TivAI about this blueprint…"
                className="flex-1 rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-2 text-sm text-text-primary"
              />
              <Button type="submit" disabled={loading || !draft.trim()}>
                <Send size={14} />
              </Button>
            </div>
          </form>
        )}
    </div>
  );
}
