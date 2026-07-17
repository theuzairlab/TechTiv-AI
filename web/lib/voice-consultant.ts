export type VoiceCallState = "idle" | "connecting" | "listening" | "speaking" | "ended";

export type TranscriptEntry = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export const voiceCapabilities = [
  "Natural conversation",
  "Business analysis",
  "Workflow recommendations",
  "Pricing estimation",
  "Meeting scheduling",
] as const;

export const voiceFlowSteps = [
  {
    state: "speaking" as const,
    role: "assistant" as const,
    text: "Hi — I'm TechTivAI's AI consultant. I'll analyze your business and recommend the right automation systems. What industry are you in?",
    delay: 800,
  },
  {
    state: "listening" as const,
    role: "user" as const,
    text: "We run a real estate agency with about 15 agents across two cities.",
    delay: 3200,
  },
  {
    state: "speaking" as const,
    role: "assistant" as const,
    text: "Real estate — great fit for voice AI. What's your biggest operational bottleneck right now?",
    delay: 2800,
  },
  {
    state: "listening" as const,
    role: "user" as const,
    text: "Lead response is too slow. We miss calls after hours and follow-ups fall through the cracks.",
    delay: 3400,
  },
  {
    state: "speaking" as const,
    role: "assistant" as const,
    text: "I'd recommend three systems: an AI voice receptionist for 24/7 coverage, CRM automation for instant follow-ups, and a lead qualification workflow connected to your pipeline.",
    delay: 3000,
  },
  {
    state: "speaking" as const,
    role: "assistant" as const,
    text: "Based on your team size, estimated setup is $4,500 one-time with $499/month maintenance. Most agencies see ROI within 60 days.",
    delay: 3500,
  },
  {
    state: "speaking" as const,
    role: "assistant" as const,
    text: "I have strategy call slots open this Thursday and Friday. Would you like me to book one for you?",
    delay: 2800,
  },
];

export const voiceStateLabels: Record<VoiceCallState, string> = {
  idle: "Ready to connect",
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "AI speaking",
  ended: "Call ended",
};
