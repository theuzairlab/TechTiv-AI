"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TranscriptEntry } from "@/lib/voice-consultant";
import { cn } from "@/lib/utils";

type VoiceTranscriptProps = {
  entries: TranscriptEntry[];
  className?: string;
};

export function VoiceTranscript({ entries, className }: VoiceTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      className={cn(
        "flex max-h-96 flex-col overflow-hidden rounded-2xl border border-glass-border bg-bg-primary/60",
        className,
      )}
    >
      <div className="shrink-0 border-b border-glass-border px-4 py-3 sm:px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Live Transcript
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 sm:p-5"
      >
        {entries.length === 0 ? (
          <p className="m-auto max-w-xs text-center text-sm text-text-muted">
            Start a call to see the live transcript
          </p>
        ) : null}

        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex w-full",
                entry.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-full max-w-[16rem] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-xs",
                  entry.role === "assistant"
                    ? "border border-accent-cyan/20 bg-accent-cyan/5 text-text-primary"
                    : "bg-bg-secondary/90 text-text-muted",
                )}
              >
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  {entry.role === "assistant" ? "AI Consultant" : "You"}
                </span>
                {entry.text}
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
