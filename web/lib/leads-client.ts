import type { CreateLeadInput } from "@/lib/leads";

type SubmitLeadResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function submitLead(payload: CreateLeadInput): Promise<SubmitLeadResult> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { id?: string; error?: string; details?: string };

    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? data.details ?? "Failed to submit. Please try again.",
      };
    }

    return { success: true, id: data.id ?? "" };
  } catch {
    return { success: false, error: "Network error. Please check your connection." };
  }
}
