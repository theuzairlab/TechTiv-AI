"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { discoverySteps } from "@/lib/discovery";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

const assistantMessages: Record<string, string[]> = {
  intro: [
    "Hi — I'm TivAI, your AI discovery consultant.",
    "I'll ask a few questions about your business and build a personalized automation blueprint with projected ROI.",
  ],
  businessType: [
    "Let's start with your industry — this shapes which AI systems will deliver the fastest wins.",
  ],
  businessSize: [
    "Team size helps me calibrate scope, pricing, and how aggressively we can automate.",
  ],
  problems: [
    "Tell me what's slowing you down. Select every bottleneck — I'll prioritize the highest-impact fixes.",
  ],
  tools: [
    "Which tools do you already use? I'll map integrations so AI plugs into your existing stack.",
  ],
  results: [
    "Your blueprint is ready. Review recommended systems, ROI projections, and next steps below.",
  ],
};

type DiscoveryAssistantProps = {
  step: number;
  showResults: boolean;
};

export function DiscoveryAssistant({ step, showResults }: DiscoveryAssistantProps) {
  const stepId = showResults
    ? "results"
    : (discoverySteps[step]?.id ?? "intro");
  const messages =
    stepId === "businessType" && step === 0
      ? [...assistantMessages.intro, ...assistantMessages.businessType]
      : assistantMessages[stepId] ?? assistantMessages.intro;

  return (
    <GlassPanel variant="elevated" className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-glass-border px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-lime text-on-accent">
          <Bot size={18} strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-text-primary">TivAI Consultant</p>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="ui-dot size-1.5 animate-status-blink rounded-full" />
            Live discovery session
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <motion.div
            key={`${stepId}-${index}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.12, duration: 0.4 }}
            className={cn(
              "max-w-[95%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed",
              "border border-glass-border bg-surface-elevated/80 text-text-body",
            )}
          >
            {message}
          </motion.div>
        ))}

        {!showResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-auto flex items-center gap-2 text-xs text-text-dim"
          >
            <Sparkles size={12} className="text-accent-cyan" />
            Analyzing your answers in real time…
          </motion.div>
        ) : null}
      </div>
    </GlassPanel>
  );
}
