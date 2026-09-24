"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityHandling,
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  type Session,
} from "@google/genai";
import { Loader2, PhoneOff } from "lucide-react";
import { mergeTranscript } from "@/lib/consultant/transcript";
import {
  ConsultantVoiceOrb,
  LiveWaveform,
  type VoiceSpeaker,
} from "@/components/consultant/consultant-voice-orb";

type TranscriptLine = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ConsultantVoiceProps = {
  analysisId: string;
  micStream: MediaStream;
  onEnded?: () => void;
};

function describeVoiceError(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.toLowerCase() === "permission denied"
  ) {
    return "Microphone is blocked. Click the padlock in the address bar → Site settings → Microphone → Allow, then start the call again.";
  }
  if (name === "NotFoundError") {
    return "No microphone was found. Plug one in and try again.";
  }
  return message || "Could not start voice";
}

function floatToPcm16(float32: Float32Array) {
  const buffer = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32[i]));
    buffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return buffer;
}

function downsample(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return floatToPcm16(input);
  const ratio = fromRate / toRate;
  const length = Math.floor(input.length / ratio);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    const next = Math.min(index + 1, input.length - 1);
    output[i] = input[index] * (1 - fraction) + input[next] * fraction;
  }
  return floatToPcm16(output);
}

function pcm16ToBase64(pcm: Int16Array) {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodePcm16(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const aligned = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(aligned).set(bytes);
  const samples = new Int16Array(aligned);
  const float32 = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) float32[i] = samples[i] / 0x8000;
  return float32;
}

function resampleFloat(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const output = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    const next = Math.min(index + 1, input.length - 1);
    output[i] = input[index] * (1 - fraction) + input[next] * fraction;
  }
  return output;
}

class PcmStreamPlayer {
  readonly context: AudioContext;
  readonly analyser: AnalyserNode;
  private readonly processor: ScriptProcessorNode;
  private readonly dummy: OscillatorNode;
  private readonly silent: GainNode;
  private readonly dest: MediaStreamAudioDestinationNode;
  private readonly element: HTMLAudioElement;
  private queue: Float32Array[] = [];
  private offset = 0;

  constructor() {
    this.context = new AudioContext({ sampleRate: 24000 });
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    this.processor = this.context.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      output.fill(0);
      let written = 0;
      while (written < output.length && this.queue.length > 0) {
        const chunk = this.queue[0];
        const take = Math.min(chunk.length - this.offset, output.length - written);
        output.set(chunk.subarray(this.offset, this.offset + take), written);
        written += take;
        this.offset += take;
        if (this.offset >= chunk.length) {
          this.queue.shift();
          this.offset = 0;
        }
      }
    };
    this.dummy = this.context.createOscillator();
    this.silent = this.context.createGain();
    this.silent.gain.value = 0;
    this.dest = this.context.createMediaStreamDestination();
    this.dummy.connect(this.silent);
    this.silent.connect(this.processor);
    this.processor.connect(this.analyser);
    this.analyser.connect(this.dest);
    this.element = new Audio();
    this.element.autoplay = true;
    this.element.srcObject = this.dest.stream;
    void this.element.play().catch(() => undefined);
    this.dummy.start();
  }

  get isPlaying() {
    return this.queue.length > 0;
  }

  push(base64: string, sampleRate = 24000) {
    const samples = resampleFloat(decodePcm16(base64), sampleRate, 24000);
    if (samples.length) this.queue.push(samples);
  }

  interrupt() {
    this.queue = [];
    this.offset = 0;
  }

  async close() {
    this.interrupt();
    this.element.pause();
    this.element.srcObject = null;
    try {
      this.dummy.stop();
    } catch {
      // already stopped
    }
    this.dummy.disconnect();
    this.silent.disconnect();
    this.processor.disconnect();
    this.analyser.disconnect();
    this.dest.disconnect();
    await this.context.close();
  }
}

function rmsFromTimeDomain(bytes: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const centered = (bytes[i] - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / bytes.length);
}

function isCaptionNoise(text: string) {
  const letters = text.replace(/[^\p{L}\p{N}]+/gu, "");
  return letters.length < 3;
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Voice service returned an empty response (${response.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 180) || "Voice service returned invalid JSON");
  }
}

export function ConsultantVoice({ analysisId, micStream, onEnded }: ConsultantVoiceProps) {
  const [speaker, setSpeaker] = useState<VoiceSpeaker>("connecting");
  const [level, setLevel] = useState(0.12);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const sessionRef = useRef<Session | null>(null);
  const playerRef = useRef<PcmStreamPlayer | null>(null);
  const audioRef = useRef<{
    input: AudioContext;
    processor: ScriptProcessorNode;
    inputAnalyser: AnalyserNode;
  } | null>(null);
  const voiceSessionIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const endingRef = useRef(false);
  const cancelledRef = useRef(false);
  const speakerRef = useRef<VoiceSpeaker>("connecting");
  const captionsRef = useRef<HTMLDivElement>(null);
  const aiRmsRef = useRef(0);

  const setLiveSpeaker = useCallback((next: VoiceSpeaker) => {
    speakerRef.current = next;
    setSpeaker(next);
  }, []);

  const appendTranscript = useCallback((role: "user" | "assistant", text: string) => {
    if (!text || isCaptionNoise(text)) return;
    const lines = transcriptRef.current;
    const last = lines[lines.length - 1];

    if (last?.role === role) {
      last.text = mergeTranscript(last.text, text);
      transcriptRef.current = [...lines];
    } else {
      transcriptRef.current = [
        ...lines,
        {
          id: `${role}-${Date.now()}-${Math.random()}`,
          role,
          text: mergeTranscript("", text),
        },
      ];
    }
    setTranscript([...transcriptRef.current]);
  }, []);

  const stopLocalAudio = useCallback(() => {
    audioRef.current?.processor.disconnect();
    void audioRef.current?.input.close();
    audioRef.current = null;
    void playerRef.current?.close();
    playerRef.current = null;
  }, []);

  const playPcm24k = useCallback((base64: string, sampleRate = 24000) => {
    playerRef.current?.push(base64, sampleRate);
    setLiveSpeaker("ai");
  }, [setLiveSpeaker]);

  const persistEnd = useCallback(async (errorMsg?: string, sessionId?: string | null) => {
    const voiceSessionId = sessionId ?? voiceSessionIdRef.current;
    if (!voiceSessionId) return;
    if (voiceSessionIdRef.current === voiceSessionId) {
      voiceSessionIdRef.current = null;
    }
    await fetch("/api/consultant/live/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voiceSessionId,
        transcript: transcriptRef.current.map((item) => ({
          role: item.role,
          text: item.text,
        })),
        errorMsg,
      }),
    }).catch(() => undefined);
  }, []);

  const endSession = useCallback(
    async (errorMsg?: string, options?: { returnToChat?: boolean }) => {
      if (endingRef.current) return;
      endingRef.current = true;
      cancelledRef.current = true;
      try {
        sessionRef.current?.close();
      } catch {
        // already closed
      }
      sessionRef.current = null;
      stopLocalAudio();
      await persistEnd(errorMsg);
      if (options?.returnToChat !== false) onEnded?.();
    },
    [onEnded, persistEnd, stopLocalAudio],
  );

  useEffect(() => {
    let dead = false;
    cancelledRef.current = false;
    endingRef.current = false;
    aiRmsRef.current = 0;
    let raf = 0;
    let ownedSessionId: string | null = null;

    function isActive() {
      return !dead && !cancelledRef.current;
    }

    async function startCall() {
      setError(null);
      setTranscript([]);
      transcriptRef.current = [];
      setLiveSpeaker("connecting");

      try {
        const stream = micStream;
        if (!stream) {
          throw new Error("Microphone is not available");
        }

        const response = await fetch("/api/consultant/live/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId }),
        });
        const payload = await parseJsonBody<{
          voiceSessionId?: string;
          token?: string;
          model?: string;
          systemInstruction?: string;
          clientName?: string;
          domain?: string;
          error?: string;
        }>(response);

        if (!isActive()) {
          await persistEnd("cancelled", payload.voiceSessionId ?? null);
          return;
        }
        if (!response.ok || !payload.token || !payload.voiceSessionId) {
          throw new Error(payload.error ?? "Could not start Gemini Live");
        }

        ownedSessionId = payload.voiceSessionId;
        voiceSessionIdRef.current = payload.voiceSessionId;

        const input = new AudioContext();
        const player = new PcmStreamPlayer();
        await input.resume();
        await player.context.resume();
        if (!isActive()) {
          await input.close();
          await player.close();
          await persistEnd("cancelled", ownedSessionId);
          return;
        }

        const source = input.createMediaStreamSource(stream);
        const inputAnalyser = input.createAnalyser();
        inputAnalyser.fftSize = 256;
        const processor = input.createScriptProcessor(2048, 1, 1);
        source.connect(inputAnalyser);
        source.connect(processor);
        const silent = input.createGain();
        silent.gain.value = 0;
        processor.connect(silent);
        silent.connect(input.destination);
        audioRef.current = { input, processor, inputAnalyser };
        playerRef.current = player;

        const inputBytes = new Uint8Array(inputAnalyser.fftSize);
        const outputBytes = new Uint8Array(player.analyser.fftSize);
        const tick = () => {
          if (!isActive()) return;
          inputAnalyser.getByteTimeDomainData(inputBytes);
          player.analyser.getByteTimeDomainData(outputBytes);
          const mic = rmsFromTimeDomain(inputBytes);
          const ai = rmsFromTimeDomain(outputBytes);
          aiRmsRef.current = ai;
          if (ai > 0.04 || player.isPlaying) {
            setLiveSpeaker("ai");
            setLevel(Math.min(1, Math.max(0.2, ai * 4)));
          } else if (mic > 0.045) {
            setLiveSpeaker("user");
            setLevel(Math.min(1, mic * 5));
          } else if (speakerRef.current !== "connecting") {
            setLiveSpeaker("listening");
            setLevel(0.12);
          }
          raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);

        const gemini = new GoogleGenAI({
          apiKey: payload.token,
          httpOptions: { apiVersion: "v1alpha" },
        });

        const session = await gemini.live.connect({
          model: payload.model || "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: payload.systemInstruction,
            proactivity: { proactiveAudio: true },
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
                prefixPaddingMs: 180,
                silenceDurationMs: 650,
              },
              activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
            },
          },
          callbacks: {
            onopen: () => {
              if (isActive()) setLiveSpeaker("listening");
            },
            onmessage: (message) => {
              if (!isActive()) return;
              const content = message.serverContent;
              if (content?.interrupted) {
                playerRef.current?.interrupt();
              }
              const inputText =
                content?.inputTranscription?.text ||
                content?.interimInputTranscription?.text;
              if (inputText) {
                appendTranscript("user", inputText);
                setLiveSpeaker("user");
              }
              const outputText = content?.outputTranscription?.text;
              if (outputText) {
                appendTranscript("assistant", outputText);
                setLiveSpeaker("ai");
              }
              if (content?.turnComplete && !playerRef.current?.isPlaying) {
                setLiveSpeaker("listening");
              }
              for (const part of content?.modelTurn?.parts ?? []) {
                const data = part.inlineData?.data;
                if (!data) continue;
                const mime = part.inlineData?.mimeType ?? "";
                const rateMatch = /rate=(\d+)/.exec(mime);
                playPcm24k(data, rateMatch ? Number(rateMatch[1]) : 24000);
              }
            },
            onerror: (event) => {
              if (!isActive()) return;
              setError(event.message || "Voice connection dropped");
            },
            onclose: (event) => {
              if (!isActive()) return;
              if (event.reason) setError(event.reason);
            },
          },
        });

        if (!isActive()) {
          session.close();
          await persistEnd("cancelled", ownedSessionId);
          return;
        }
        sessionRef.current = session;

        processor.onaudioprocess = (event) => {
          if (!isActive() || !sessionRef.current) return;
          const inputSamples = event.inputBuffer.getChannelData(0);
          const micRms = Math.sqrt(
            inputSamples.reduce((sum, sample) => sum + sample * sample, 0) / inputSamples.length,
          );
          if (playerRef.current?.isPlaying && micRms > Math.max(0.05, aiRmsRef.current * 1.8 + 0.02)) {
            playerRef.current.interrupt();
            setLiveSpeaker("user");
          }
          const pcm = downsample(inputSamples, input.sampleRate, 16000);
          sessionRef.current.sendRealtimeInput({
            audio: {
              data: pcm16ToBase64(pcm),
              mimeType: "audio/pcm;rate=16000",
            },
          });
        };

        session.sendRealtimeInput({
          text: `The caller ${payload.clientName || "there"} is on the line about ${payload.domain || "their blueprint"}. Greet them in one short sentence, then wait.`,
        });
        setLiveSpeaker("listening");
      } catch (err) {
        if (!isActive()) return;
        const message = describeVoiceError(err);
        setError(message);
        stopLocalAudio();
        await persistEnd(message, ownedSessionId);
      }
    }

    void startCall();

    return () => {
      dead = true;
      cancelledRef.current = true;
      window.cancelAnimationFrame(raf);
      try {
        sessionRef.current?.close();
      } catch {
        // ignore
      }
      sessionRef.current = null;
      stopLocalAudio();
      void persistEnd(undefined, ownedSessionId);
    };
    // Connect once per blueprint. Callbacks are stable enough for this session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  const captions = transcript.slice(-6);

  useEffect(() => {
    const node = captionsRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      <ConsultantVoiceOrb speaker={speaker} level={level} />
      <div className="mt-6 w-full max-w-md">
        <LiveWaveform speaker={speaker} level={level} />
      </div>
      <div
        ref={captionsRef}
        className="mt-5 max-h-52 w-full max-w-lg space-y-3 overflow-y-auto text-left"
      >
        {captions.length === 0 ? (
          <p className="text-center text-sm leading-relaxed text-text-muted">
            {speaker === "connecting"
              ? "Connecting to Gemini Live…"
              : "Say hello — TivAI is listening."}
          </p>
        ) : (
          captions.map((line) => (
            <div key={line.id} className="rounded-2xl border border-white/5 bg-white/3 px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {line.role === "user" ? "You" : "TivAI"}
              </p>
              <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-text-primary">
                {line.text}
              </p>
            </div>
          ))
        )}
      </div>
      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <button
        type="button"
        onClick={() => void endSession()}
        className="mt-8 inline-flex h-11 items-center rounded-full border border-accent-rose/40 bg-accent-rose/10 px-6 text-sm text-accent-rose hover:bg-accent-rose/20"
      >
        {speaker === "connecting" ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <PhoneOff size={16} className="mr-2" />
        )}
        End call
      </button>
    </div>
  );
}
