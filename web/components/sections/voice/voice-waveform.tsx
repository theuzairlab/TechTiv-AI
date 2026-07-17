"use client";

import { motion } from "framer-motion";
import type { VoiceCallState } from "@/lib/voice-consultant";
import { cn } from "@/lib/utils";

type VoiceWaveformProps = {
  state: VoiceCallState;
  className?: string;
};

const BAR_COUNT = 24;

export function VoiceWaveform({ state, className }: VoiceWaveformProps) {
  const isActive = state === "speaking" || state === "listening";

  return (
    <div
      className={cn(
        "flex h-16 items-center justify-center gap-1 sm:h-20 sm:gap-1.5",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "w-1 rounded-full sm:w-1.5",
            isActive ? "bg-accent-cyan" : "bg-text-muted/30",
          )}
          animate={
            isActive
              ? {
                  height: [
                    8,
                    state === "speaking"
                      ? 12 + (index % 5) * 8
                      : 6 + (index % 3) * 4,
                    10 + (index % 4) * 6,
                    8,
                  ],
                  opacity: [0.4, 1, 0.7, 0.4],
                }
              : { height: 6, opacity: 0.25 }
          }
          transition={
            isActive
              ? {
                  duration: state === "speaking" ? 0.5 : 0.8,
                  repeat: Infinity,
                  delay: index * 0.04,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
