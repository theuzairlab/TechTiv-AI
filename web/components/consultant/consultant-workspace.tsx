"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Mic } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { ConsultantChat } from "@/components/consultant/consultant-chat";
import { ConsultantVoice } from "@/components/consultant/consultant-voice";
import {
  ConsultantBlueprintPicker,
  type ConsultantBlueprintOption,
} from "@/components/consultant/consultant-blueprint-picker";

type ConsultantWorkspaceProps = {
  analysisId: string;
  blueprints: ConsultantBlueprintOption[];
};

function micDeniedMessage(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.toLowerCase() === "permission denied"
  ) {
    return "Microphone is blocked. Click the padlock in the address bar → Site settings → Microphone → Allow, then try AI voice call again.";
  }
  if (name === "NotFoundError") {
    return "No microphone was found. Plug one in and try again.";
  }
  return message || "Could not open the microphone";
}

export function ConsultantWorkspace({
  analysisId,
  blueprints,
}: ConsultantWorkspaceProps) {
  const selected =
    blueprints.find((item) => item.id === analysisId) ?? blueprints[0];
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash === "#voice") {
      void startVoiceCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  useEffect(() => {
    return () => {
      micStream?.getTracks().forEach((track) => track.stop());
    };
  }, [micStream]);

  async function startVoiceCall() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      setMicStream(stream);
      setMode("voice");
    } catch (error) {
      setMicError(micDeniedMessage(error));
    }
  }

  function endVoiceCall() {
    micStream?.getTracks().forEach((track) => track.stop());
    setMicStream(null);
    setMode("chat");
  }

  if (!selected) return null;

  return (
    <div className="space-y-4">
      <ConsultantBlueprintPicker selected={selected} blueprints={blueprints} />

      <GlassPanel className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mode === "voice" ? (
              <Mic size={18} className="text-brand-cyan" />
            ) : (
              <MessageSquare size={18} className="text-brand-cyan" />
            )}
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {mode === "voice" ? "Voice call" : "Chat"}
            </h2>
          </div>
          {mode === "chat" ? (
            <Button type="button" size="sm" onClick={() => void startVoiceCall()}>
              <Mic size={14} className="mr-1.5" />
              AI voice call
            </Button>
          ) : null}
        </div>

        {micError ? (
          <p className="mb-4 text-sm text-destructive">{micError}</p>
        ) : null}

        {mode === "voice" && micStream ? (
          <ConsultantVoice
            analysisId={analysisId}
            micStream={micStream}
            onEnded={endVoiceCall}
          />
        ) : (
          <ConsultantChat analysisId={analysisId} />
        )}
      </GlassPanel>
    </div>
  );
}
