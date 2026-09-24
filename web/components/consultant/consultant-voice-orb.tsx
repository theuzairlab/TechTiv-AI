"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type VoiceSpeaker = "connecting" | "listening" | "user" | "ai" | "researching";

type ConsultantVoiceOrbProps = {
  speaker: VoiceSpeaker;
  level: number;
};

export function ConsultantVoiceOrb({ speaker, level }: ConsultantVoiceOrbProps) {
  const intensity = Math.min(1, Math.max(0.08, level));
  const isAi = speaker === "ai";
  const isUser = speaker === "user";
  const active = speaker === "ai" || speaker === "user" || speaker === "listening";

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className={cn(
            "absolute rounded-full border",
            isUser ? "border-accent-lime/30" : "border-accent-cyan/30",
          )}
          style={{
            width: `${9 + ring * 3.2}rem`,
            height: `${9 + ring * 3.2}rem`,
          }}
          animate={
            active
              ? {
                  scale: [1, 1.08 + intensity * 0.25, 1],
                  opacity: [0.35, 0.05, 0.35],
                }
              : { scale: 1, opacity: 0.12 }
          }
          transition={{
            duration: isAi ? 0.9 : 1.6,
            delay: ring * 0.18,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        className={cn(
          "relative z-10 flex h-32 w-32 items-center justify-center rounded-full border-2 bg-linear-to-br from-accent-violet/40 via-bg-secondary to-accent-cyan/30 sm:h-36 sm:w-36",
          isUser ? "border-accent-lime/70 shadow-glow-lime" : "border-accent-cyan/70 shadow-glow-cyan",
        )}
        animate={{
          scale: 1 + intensity * (isAi ? 0.22 : 0.14),
        }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <div className="flex flex-col items-center">
          <span className="font-display text-3xl font-bold text-gradient-cyan sm:text-4xl">
            AI
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            {speaker === "connecting"
              ? "Connecting"
              : speaker === "researching"
                ? "Research"
                : speaker === "ai"
                  ? "Speaking"
                  : speaker === "user"
                    ? "Listening"
                    : "Ready"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

type LiveWaveformProps = {
  level: number;
  speaker: VoiceSpeaker;
};

export function LiveWaveform({ level, speaker }: LiveWaveformProps) {
  const bars = 28;
  const active = speaker === "ai" || speaker === "user";

  return (
    <div className="flex h-16 items-end justify-center gap-1 sm:h-20">
      {Array.from({ length: bars }).map((_, index) => {
        const wave = 0.25 + Math.abs(Math.sin(index * 0.45)) * 0.75;
        const height = active ? Math.max(6, 8 + level * wave * 52) : 6;
        return (
          <span
            key={index}
            className={cn(
              "w-1 rounded-full sm:w-1.5",
              speaker === "user" ? "bg-accent-lime" : "bg-accent-cyan",
              !active && "bg-text-muted/30",
            )}
            style={{
              height,
              opacity: active ? 0.45 + level * 0.55 : 0.25,
              transition: "height 80ms linear, opacity 80ms linear",
            }}
          />
        );
      })}
    </div>
  );
}
