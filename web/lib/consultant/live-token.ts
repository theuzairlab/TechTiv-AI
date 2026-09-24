import { GoogleGenAI } from "@google/genai";

const LIVE_FALLBACK = "gemini-3.1-flash-live-preview";

function isLiveModel(model: string) {
  const value = model.toLowerCase();
  return value.includes("live") || value.includes("native-audio");
}

/** Chat models like gemini-3.6-flash cannot use the Live API. */
export function resolveGeminiLiveModel() {
  const requested = process.env.GEMINI_LIVE_MODEL?.trim();
  if (requested && isLiveModel(requested)) return requested;
  return LIVE_FALLBACK;
}

export const GEMINI_LIVE_MODEL = resolveGeminiLiveModel();

function requireGeminiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

async function mintWithSdk() {
  const apiKey = requireGeminiKey();
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: "v1alpha" },
  });

  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime,
    },
  });

  if (!token.name) throw new Error("Gemini did not return a live token");
  return token.name;
}

async function mintRest() {
  const apiKey = requireGeminiKey();
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1alpha/auth_tokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        uses: 1,
        expireTime,
        newSessionExpireTime,
      }),
    },
  );
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Gemini token HTTP ${response.status}: empty response`);
  }
  const payload = JSON.parse(text) as { name?: string; error?: { message?: string } };
  if (!response.ok || !payload.name) {
    throw new Error(payload.error?.message ?? `Gemini token HTTP ${response.status}`);
  }
  return payload.name;
}

export async function createGeminiLiveToken() {
  try {
    const token = await mintWithSdk();
    return { token, model: GEMINI_LIVE_MODEL };
  } catch (sdkError) {
    try {
      const token = await mintRest();
      return { token, model: GEMINI_LIVE_MODEL };
    } catch (restError) {
      const sdkMessage = sdkError instanceof Error ? sdkError.message : "SDK mint failed";
      const restMessage = restError instanceof Error ? restError.message : "REST mint failed";
      throw new Error(`${sdkMessage}; ${restMessage}`);
    }
  }
}
