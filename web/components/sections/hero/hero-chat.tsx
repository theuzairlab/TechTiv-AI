"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getMockChatResponse, heroPrompts } from "@/lib/hero";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm TechTivAI's automation architect. Describe your business or pick a prompt below. I'll recommend AI systems and estimated ROI.",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-2 w-2 rounded-full bg-accent-cyan"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

type HeroChatProps = {
  className?: string;
};

export function HeroChat({ className }: HeroChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const response = getMockChatResponse(trimmed);
    const delay = 800 + Math.min(response.length * 12, 1800);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
        },
      ]);
      setIsTyping(false);
    }, delay);
  }, [isTyping]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <GlassPanel variant="elevated" className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between border-b border-glass-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-cyan/15 text-sm font-bold text-accent-cyan ring-1 ring-accent-cyan/30">
            AI
          </span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              TechTivAI Assistant
            </p>
            <p className="text-xs text-text-muted">Automation architect</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs text-brand">
          <span className="ui-dot h-1.5 w-1.5 animate-pulse rounded-full" />
          Online
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-72 min-h-56 flex-col gap-3 overflow-y-auto px-5 py-4 sm:max-h-80 sm:px-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-bg-secondary/90 text-text-muted"
                  : "border border-accent-cyan/20 bg-accent-cyan/5 text-text-primary",
              )}
            >
              {message.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping ? (
          <div className="max-w-[92%] rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 px-4">
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      <div className="border-t border-glass-border px-5 py-3 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {heroPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isTyping}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-glass-border bg-bg-secondary/60 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent-cyan/40 hover:text-text-primary disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe your business..."
            disabled={isTyping}
            className="h-11 min-w-0 flex-1 rounded-xl border border-glass-border bg-bg-primary/80 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-accent-cyan px-4 text-sm font-medium text-bg-primary transition-all hover:brightness-110 disabled:opacity-40"
          >
            Send
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-text-muted sm:text-xs">
          Demo mode — live AI streaming connects in Phase 3
        </p>
      </div>
    </GlassPanel>
  );
}
