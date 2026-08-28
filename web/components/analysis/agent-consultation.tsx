"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  confirmConsultation,
  getConsultation,
  replyConsultation,
  startConsultation,
  type ConsultationMessage,
  type ConsultationQuestion,
} from "@/lib/consultation/client";
import { cn } from "@/lib/utils";

type Session = { analysisId: string; guestAccessToken: string };

export function AgentConsultation({
  restoredSession,
  onSession,
  onConfirmed,
}: {
  restoredSession?: Session | null;
  onSession: (session: Session) => void;
  onConfirmed: (session: Session, companyLabel: string) => void;
}) {
  const [session, setSession] = useState<Session | null>(
    restoredSession ?? null,
  );
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [links, setLinks] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [waiting, setWaiting] = useState(Boolean(restoredSession));
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const awaitingAfterAssistantIdRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  const latestQuestionTurn = useMemo(() => {
    const message = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.inputJson);
    return message
      ? {
          id: message.id,
          question: message.inputJson as ConsultationQuestion,
        }
      : undefined;
  }, [messages]);
  const latestQuestion = latestQuestionTurn?.question;

  useEffect(() => {
    if (!session || !waiting) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await getConsultation(
          session.analysisId,
          session.guestAccessToken,
        );
        if (cancelled) return;
        const latestAssistant = [...data.messages]
          .reverse()
          .find((message) => message.role === "assistant" && message.inputJson);
        const previousAssistantId = awaitingAfterAssistantIdRef.current;
        const hasNewAssistant =
          latestAssistant &&
          (!previousAssistantId || latestAssistant.id !== previousAssistantId);
        if (hasNewAssistant) {
          setMessages(data.messages);
          setSelectedOptions([]);
          awaitingAfterAssistantIdRef.current = null;
          sendingRef.current = false;
          setWaiting(false);
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Connection lost");
        }
      }
      if (!cancelled) window.setTimeout(poll, 1200);
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [session, waiting]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, waiting]);

  const begin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setWaiting(true);
    try {
      const next = await startConsultation({
        companyName,
        links,
        additionalInfo: additionalInfo.trim() || undefined,
      });
      setSession(next);
      onSession(next);
      setMessages([
        {
          id: "opening",
          role: "assistant",
          content:
            "I’ll research your business first, then ask only what matters before building your plan.",
          inputJson: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "initial",
          role: "user",
          content: [
            `${companyName} — ${links}`,
            additionalInfo.trim() ? `Additional context: ${additionalInfo.trim()}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          inputJson: null,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setWaiting(false);
      setError(err instanceof Error ? err.message : "Could not start");
    }
  };

  const send = async (value = answer) => {
    if (
      !session ||
      !latestQuestion ||
      !latestQuestionTurn ||
      !value.trim() ||
      sendingRef.current
    ) {
      return;
    }
    sendingRef.current = true;
    awaitingAfterAssistantIdRef.current = latestQuestionTurn.id;
    const content = value.trim();
    setAnswer("");
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        inputJson: { field: latestQuestion.field, value: content },
        createdAt: new Date().toISOString(),
      },
    ]);
    setWaiting(true);
    try {
      await replyConsultation({
        analysisId: session.analysisId,
        guestAccessToken: session.guestAccessToken,
        field: latestQuestion.field,
        value: content,
      });
    } catch (err) {
      sendingRef.current = false;
      awaitingAfterAssistantIdRef.current = null;
      setWaiting(false);
      setError(err instanceof Error ? err.message : "Could not send answer");
    }
  };

  const confirm = async () => {
    if (!session) return;
    setWaiting(true);
    try {
      await confirmConsultation({
        analysisId: session.analysisId,
        guestAccessToken: session.guestAccessToken,
      });
      onConfirmed(session, companyName || "Your business");
    } catch (err) {
      setWaiting(false);
      setError(err instanceof Error ? err.message : "Could not start research");
    }
  };

  if (!session) {
    return (
      <form onSubmit={begin} className="mx-auto max-w-2xl space-y-5">
        <AgentBubble>
          <p className="text-base leading-relaxed text-text-primary">
            Tell me the business name and where I can find it online. I’ll
            research it first, ask only what matters, then start the deeper
            research.
          </p>
        </AgentBubble>
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
          <label className="text-sm font-semibold text-text-muted">
            Business name
          </label>
          <input
            required
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Acme"
            className="mt-2 h-11 w-full bg-transparent text-lg text-text-primary outline-none"
          />
          <div className="my-2 border-t border-border-subtle" />
          <label className="text-sm font-semibold text-text-muted">
            Website and/or social profiles
          </label>
          <textarea
            required
            rows={2}
            value={links}
            onChange={(event) => setLinks(event.target.value)}
            placeholder="acme.com, instagram.com/acme, tiktok.com/@acme"
            className="mt-2 min-h-11 w-full resize-none bg-transparent text-lg text-text-primary outline-none"
          />
          <p className="mt-1 text-sm text-text-muted">
            Separate multiple links with commas — a website and any social
            profiles you want reviewed.
          </p>
          <div className="my-2 border-t border-border-subtle" />
          <label className="text-sm font-semibold text-text-muted">
            More information{" "}
            <span className="font-normal text-text-muted/70">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
            placeholder="Anything specific you want us to know — a problem you're facing, a goal you have, or context that isn't obvious from your site."
            className="mt-2 min-h-10 w-full resize-none bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted/60"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={waiting}
              aria-label="Start consultation"
              className="flex size-10 items-center justify-center rounded-xl bg-accent-lime text-bg-primary disabled:opacity-50"
            >
              {waiting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ArrowUp size={17} />
              )}
            </button>
          </div>
        </div>
        {error ? <p className="text-base text-accent-rose">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4" aria-live="polite">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-cyan/12 px-4 py-3 text-base leading-relaxed text-text-primary">
                {message.content}
              </div>
            ) : (
              <AgentBubble>{message.content}</AgentBubble>
            )}
          </motion.div>
        ))}
        {waiting ? (
          <div className="flex items-center gap-2 px-3 py-2 text-base text-text-muted">
            <Loader2 size={14} className="animate-spin text-brand-cyan" />
            {latestQuestionTurn
              ? "Reviewing your answer…"
              : "Reading your website and social profiles…"}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {!waiting && latestQuestion?.complete ? (
        <div className="mt-5 rounded-2xl border border-brand/25 bg-brand/5 p-4">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 size-5 text-brand" />
            <div className="flex-1">
              <p className="text-lg font-medium text-text-primary">Brief ready</p>
              <p className="mt-1 text-base text-text-muted">
                I’ll now verify the evidence, compare the market, and build your
                action plan.
              </p>
              <Button type="button" className="mt-4" onClick={confirm}>
                Start research <Sparkles size={15} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : !waiting && latestQuestion ? (
        <div className="sticky bottom-4 mt-5 rounded-2xl border border-border-subtle bg-bg-primary/95 p-3 shadow-2xl backdrop-blur-xl">
          {["choices", "single_choice", "multi_choice"].includes(
            latestQuestion.inputType,
          ) && latestQuestion.options?.length ? (
            <div className="mb-3 space-y-2">
              <p className="px-1 text-xs text-text-muted">
                {latestQuestion.inputType === "multi_choice"
                  ? "Select all that apply"
                  : "Select one option"}
              </p>
              {latestQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (latestQuestion.inputType === "multi_choice") {
                      setSelectedOptions((current) =>
                        current.includes(option)
                          ? current.filter((item) => item !== option)
                          : [...current, option],
                      );
                    } else {
                      setSelectedOptions([option]);
                      void send(option);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-base transition-colors",
                    selectedOptions.includes(option)
                      ? "border-brand-cyan/50 bg-brand-cyan/10 text-text-primary"
                      : "border-border-subtle text-text-muted hover:border-brand-cyan/35 hover:text-text-primary",
                  )}
                >
                  {latestQuestion.inputType === "multi_choice" ? (
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border",
                        selectedOptions.includes(option)
                          ? "border-brand-cyan bg-brand-cyan text-bg-primary"
                          : "border-border-subtle",
                      )}
                    >
                      {selectedOptions.includes(option) ? (
                        <Check size={13} strokeWidth={3} />
                      ) : null}
                    </span>
                  ) : selectedOptions.includes(option) ? (
                    <CheckCircle2 size={19} className="shrink-0 text-brand-cyan" />
                  ) : (
                    <Circle size={19} className="shrink-0 text-text-muted" />
                  )}
                  {option}
                </button>
              ))}
              {latestQuestion.inputType === "multi_choice" ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  disabled={selectedOptions.length === 0}
                  onClick={() => void send(selectedOptions.join(", "))}
                >
                  Continue with {selectedOptions.length} selected
                </Button>
              ) : null}
            </div>
          ) : null}
          {!["choices", "single_choice", "multi_choice"].includes(
            latestQuestion.inputType,
          ) ? (
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Type your answer…"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-base text-text-primary outline-none"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!answer.trim()}
              className="flex size-10 items-center justify-center rounded-xl bg-accent-lime text-bg-primary disabled:opacity-40"
            >
              <ArrowUp size={17} />
            </button>
          </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-base text-accent-rose">{error}</p> : null}
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-[92%] gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/12 text-brand-cyan">
        <Bot size={16} />
      </span>
      <div className="rounded-2xl rounded-bl-md border border-border-subtle bg-bg-secondary/40 px-4 py-3 text-base leading-relaxed text-text-primary">
        {children}
      </div>
    </div>
  );
}
