"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { VoiceAvatar } from "@/components/sections/voice/voice-avatar";
import { VoiceTranscript } from "@/components/sections/voice/voice-transcript";
import { VoiceWaveform } from "@/components/sections/voice/voice-waveform";
import {
  voiceCapabilities,
  voiceFlowSteps,
  voiceStateLabels,
  type TranscriptEntry,
  type VoiceCallState,
} from "@/lib/voice-consultant";
import { cn } from "@/lib/utils";

function scheduleVoiceFlow(
  setCallState: (state: VoiceCallState) => void,
  setTranscript: React.Dispatch<React.SetStateAction<TranscriptEntry[]>>,
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  const runStep = (index: number) => {
    if (index >= voiceFlowSteps.length) {
      setCallState("listening");
      return;
    }

    const step = voiceFlowSteps[index];
    setCallState(step.state);

    timeoutRef.current = setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        { id: `msg-${index}`, role: step.role, text: step.text },
      ]);

      timeoutRef.current = setTimeout(() => runStep(index + 1), 700);
    }, step.delay);
  };

  runStep(0);
}

export function VoiceConsultantUI() {
  const [callState, setCallState] = useState<VoiceCallState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScheduled = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const endCall = useCallback(() => {
    clearScheduled();
    setCallState("ended");
    window.setTimeout(() => {
      setCallState("idle");
      setTranscript([]);
    }, 2000);
  }, [clearScheduled]);

  const startCall = useCallback(() => {
    if (callState !== "idle" && callState !== "ended") return;

    clearScheduled();
    setTranscript([]);
    setCallState("connecting");

    timeoutRef.current = setTimeout(() => {
      scheduleVoiceFlow(setCallState, setTranscript, timeoutRef);
    }, 1200);
  }, [callState, clearScheduled]);

  useEffect(() => () => clearScheduled(), [clearScheduled]);

  const isInCall =
    callState !== "idle" && callState !== "ended";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      <GlassPanel variant="elevated" className="flex flex-col items-center p-6 sm:p-8">
        <VoiceAvatar state={callState} />

        <div className="mt-6 w-full">
          <VoiceWaveform state={callState} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              callState === "idle" && "bg-text-muted/40",
              callState === "connecting" && "animate-pulse bg-accent-cyan",
              callState === "listening" && "animate-pulse bg-ui-dot",
              callState === "speaking" && "animate-pulse bg-accent-cyan",
              callState === "ended" && "bg-accent-rose",
            )}
          />
          <p className="text-sm text-text-muted">
            {voiceStateLabels[callState]}
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {!isInCall ? (
            <Button size="lg" onClick={startCall} className="w-full sm:w-auto">
              Talk To Your AI Consultant
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                disabled
              >
                🎤 Mute
              </Button>
              <Button
                variant="rose"
                size="lg"
                className="w-full sm:w-auto"
                onClick={endCall}
              >
                End Call
              </Button>
            </>
          )}
        </div>

        {callState === "ended" ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-accent-rose"
          >
            Call ended — transcript cleared shortly
          </motion.p>
        ) : null}

        <p className="mt-4 text-center text-[10px] text-text-muted sm:text-xs">
          Demo simulation — live Vapi voice connects in Phase 4
        </p>
      </GlassPanel>

      <div className="flex flex-col gap-6">
        <VoiceTranscript entries={transcript} className="flex-1" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Voice AI Capabilities
          </p>
          <div className="flex flex-wrap gap-2">
            {voiceCapabilities.map((capability) => (
              <Badge key={capability} variant="cyan">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        <GlassPanel className="p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Consultation Flow
          </p>
          <ol className="space-y-2 text-sm text-text-muted">
            {[
              "AI greets you and asks discovery questions",
              "Analyzes your business needs in real time",
              "Recommends automation systems",
              "Estimates pricing and ROI",
              "Books a strategy meeting",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-violet/15 text-[10px] font-bold text-accent-violet">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </GlassPanel>
      </div>
    </div>
  );
}
