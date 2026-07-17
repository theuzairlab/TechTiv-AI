"use client";

import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

const mockReplies: Record<string, string> = {
  "what ai services do you offer?":
    "TechTivAI offers 30+ services: business automation, AI agents, custom LLMs, workflow automation, data science, sales & marketing AI, chatbots, voice agents, and more. Book a free strategy session for a tailored roadmap.",
  "how much does it cost?":
    "Plans start at $999/mo (Growth), $1,999/mo (Scale — most popular), and custom Enterprise pricing. Every plan is designed for clear ROI. Want a custom quote?",
  "i want to automate my business":
    "Great choice. We start with a free AI audit, map your highest-ROI automations, then deploy agents and workflows in as little as 6 weeks. Book your free session above.",
  "tell me about ai agents":
    "We deploy autonomous agent fleets — sales SDRs, research bots, support agents, and compliance agents — orchestrated with LangGraph and CrewAI. They work 24/7 across your stack.",
};

const defaultReply =
  "I'd love to help! Book a free 45-minute AI Strategy Session and our team will map the best automation plan for your business.";

function getReply(message: string) {
  const key = message.trim().toLowerCase();
  return mockReplies[key] ?? defaultReply;
}

export function LandingChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "ai" | "user"; text: string; time: string }>
  >([
    {
      id: "welcome",
      role: "ai",
      text: "Hi! I'm TivAI, your intelligent assistant. I can help you explore TechTivAI's services, build your AI roadmap, or answer any questions about AI automation for your business. What can I help you with?",
      time: "Just now",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setShowQuickActions(false);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { id: `user-${prev.length}`, role: "user", text: trimmed, time },
    ]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${prev.length}`,
          role: "ai",
          text: getReply(trimmed),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 900);
  };

  return (
    <div className="fixed bottom-7 right-7 z-[900]">
      <div
        className={cn(
          "absolute right-0 bottom-[72px] flex max-h-[520px] w-[380px] max-md:w-[calc(100vw-56px)] flex-col overflow-hidden rounded-surface-xl border border-border-highlight bg-surface-card shadow-[0_32px_80px_rgba(0,0,0,0.5)]",
          open ? "flex animate-chat-slide" : "hidden",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border-subtle bg-gradient-to-br from-accent-cyan/12 to-accent-lime/10 px-5 py-[18px]">
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent-cyan to-accent-lime text-on-accent">
            <Bot size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="flex-1">
            <div className="text-[0.9rem] font-bold text-text-primary">TivAI Assistant</div>
            <div className="flex items-center gap-1.5 text-[0.72rem] text-text-muted before:size-1.5 before:rounded-full before:bg-ui-dot before:content-['']">
              Online — Powered by TechTivAI
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-text-muted"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            data-cursor-target
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div
          className="flex max-h-80 flex-1 flex-col gap-3.5 overflow-y-auto p-5"
          ref={messagesRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%]",
                message.role === "ai" ? "self-start" : "self-end",
              )}
            >
              <div
                className={cn(
                  "rounded-[14px] px-4 py-3 text-[0.85rem] leading-relaxed",
                  message.role === "ai"
                    ? "rounded-bl rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-surface-elevated text-text-body"
                    : "rounded-bl-[14px] rounded-br rounded-tl-[14px] rounded-tr-[14px] bg-gradient-to-br from-accent-cyan to-accent-lime text-on-accent",
                )}
              >
                {message.text}
              </div>
              <div
                className={cn(
                  "mt-1 px-1 text-[0.65rem] text-text-muted",
                  message.role === "user" && "text-right",
                )}
              >
                {message.time}
              </div>
            </div>
          ))}
          {typing ? (
            <div className="max-w-[85%] self-start">
              <div className="rounded-[14px] rounded-bl bg-surface-elevated px-4 py-3 text-text-body">
                <div className="flex items-center gap-1 py-2">
                  <div className="size-1.5 animate-typing rounded-full bg-text-muted" />
                  <div className="size-1.5 animate-typing rounded-full bg-text-muted [animation-delay:0.2s]" />
                  <div className="size-1.5 animate-typing rounded-full bg-text-muted [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {showQuickActions ? (
          <div className="flex flex-wrap gap-[7px] px-5 pb-3.5">
            {[
              "What AI services do you offer?",
              "How much does it cost?",
              "I want to automate my business",
              "Tell me about AI agents",
            ].map((action) => (
              <button
                key={action}
                type="button"
                className="cursor-pointer whitespace-nowrap rounded-full border border-border-subtle bg-surface-elevated px-[11px] py-[5px] text-[0.72rem] font-medium text-text-muted transition-all duration-200 hover:border-border-highlight hover:text-brand-cyan"
                onClick={() => sendMessage(action)}
                data-cursor-target
              >
                {action === "What AI services do you offer?"
                  ? "Services overview"
                  : action === "How much does it cost?"
                    ? "Pricing"
                    : action === "I want to automate my business"
                      ? "Automate my biz"
                      : "AI Agents"}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2.5 border-t border-border-subtle p-4">
          <input
            className="flex-1 rounded-[10px] border border-border-subtle bg-surface-elevated px-4 py-[11px] font-[inherit] text-[0.85rem] text-text-body outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-border-highlight"
            placeholder="Ask anything about AI..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage(input);
            }}
          />
          <button
            type="button"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border-none bg-accent-lime text-on-accent transition-transform duration-200 hover:scale-105 hover:bg-accent-cyan"
            onClick={() => sendMessage(input)}
            aria-label="Send message"
            data-cursor-target
          >
            <Send size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="flex size-[58px] cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-accent-cyan to-accent-lime text-on-accent shadow-[0_8px_32px_var(--shadow-cyan)] transition-[transform,box-shadow] duration-200 hover:scale-[1.08] hover:shadow-[0_12px_40px_var(--shadow-lime)]"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close chat" : "Open chat"}
        data-cursor-target
      >
        {open ? (
          <X size={22} strokeWidth={2} />
        ) : (
          <AnimatedIcon icon={Bot} size={24} className="text-on-accent" interactive={false} />
        )}
      </button>
    </div>
  );
}
