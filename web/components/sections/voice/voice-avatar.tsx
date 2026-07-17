"use client";

import { motion } from "framer-motion";
import type { VoiceCallState } from "@/lib/voice-consultant";
import { cn } from "@/lib/utils";

type VoiceAvatarProps = {
  state: VoiceCallState;
};

const stateRingColors: Record<VoiceCallState, string> = {
  idle: "border-glass-border",
  connecting: "border-accent-cyan/40",
  listening: "border-accent-lime/50",
  speaking: "border-accent-cyan/60",
  ended: "border-glass-border",
};

export function VoiceAvatar({ state }: VoiceAvatarProps) {
  const isActive = state === "speaking" || state === "listening" || state === "connecting";

  return (
    <div className="relative flex items-center justify-center">
      {isActive ? (
        <>
          <motion.span
            className={cn(
              "absolute h-28 w-28 rounded-full border sm:h-32 sm:w-32",
              state === "listening" ? "border-accent-lime/30" : "border-accent-cyan/30",
            )}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className={cn(
              "absolute h-36 w-36 rounded-full border sm:h-40 sm:w-40",
              state === "listening" ? "border-accent-lime/20" : "border-accent-cyan/20",
            )}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />
        </>
      ) : null}

      <motion.div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-full border-2 bg-linear-to-br from-accent-violet/30 via-bg-secondary to-accent-cyan/20 sm:h-28 sm:w-28",
          stateRingColors[state],
          isActive && "shadow-glow-cyan",
        )}
        animate={{
          scale: state === "speaking" ? [1, 1.03, 1] : 1,
        }}
        transition={{
          duration: 1.2,
          repeat: state === "speaking" ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-display text-2xl font-bold text-gradient-cyan sm:text-3xl">
            AI
          </span>
          {state === "listening" ? (
            <motion.span
              className="ui-dot h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : state === "speaking" ? (
            <motion.span
              className="flex gap-0.5"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1 w-1 rounded-full bg-accent-cyan"
                />
              ))}
            </motion.span>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
