import { callProvider } from "@/lib/providers";
import { CONSULTANT_TOOLS } from "@/lib/consultant/tools";
import { runConsultantTool, type ToolRunResult } from "@/lib/consultant/research";

const GEMINI_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-2.5-flash";

function asArgs(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return { query: value };
    }
  }
  return {};
}

type GeminiPart = {
  text?: string;
  functionCall?: { name?: string; args?: unknown };
  functionResponse?: { name: string; response: { result: unknown } };
};

type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
};

function requireGeminiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

async function generateOnce(
  analysisId: string,
  contents: GeminiContent[],
  systemInstruction: string,
) {
  return callProvider({
    provider: "gemini",
    endpoint: `models/${GEMINI_CHAT_MODEL}:generateContent`,
    analysisId,
    costEstimateUSD: 0.004,
    creditsOrTokens: 1,
    fn: async () => {
      const key = requireGeminiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            tools: [{ function_declarations: CONSULTANT_TOOLS }],
            generation_config: {
              temperature: 0.35,
              maxOutputTokens: 220,
            },
          }),
        },
      );
      const payload = (await response.json()) as GeminiResponse;
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? "Gemini request failed");
      }
      return payload;
    },
  });
}

export async function runConsultantChat(options: {
  analysisId: string;
  systemInstruction: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
}): Promise<{ reply: string; research: ToolRunResult[] }> {
  const contents: GeminiContent[] = [];
  for (const item of options.history.slice(-16)) {
    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: options.userMessage }] });

  const research: ToolRunResult[] = [];

  for (let round = 0; round < 5; round += 1) {
    const payload = await generateOnce(
      options.analysisId,
      contents,
      options.systemInstruction,
    );
    const parts = payload.candidates?.[0]?.content?.parts ?? [];
    const calls = parts.filter((part) => part.functionCall?.name);

    if (calls.length === 0) {
      const reply = parts
        .map((part) => part.text ?? "")
        .join("\n")
        .trim();
      return {
        reply: reply || "I wasn’t able to form a reply just then. Please try again.",
        research,
      };
    }

    contents.push({ role: "model", parts });
    const toolParts: GeminiPart[] = [];
    for (const part of calls) {
      const name = part.functionCall?.name ?? "";
      const args = asArgs(part.functionCall?.args);
      const result = await runConsultantTool({
        analysisId: options.analysisId,
        name,
        args,
      });
      research.push(result);
      toolParts.push({
        functionResponse: {
          name,
          response: { result: result.data },
        },
      });
    }
    contents.push({ role: "user", parts: toolParts });
  }

  return {
    reply: "I hit the research limit for this turn. Ask me to continue and I’ll pick up from here.",
    research,
  };
}
