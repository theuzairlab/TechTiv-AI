export type ConsultationQuestion = {
  message: string;
  field: string;
  inputType:
    | "text"
    | "textarea"
    | "choices"
    | "single_choice"
    | "multi_choice";
  options?: string[];
  complete: boolean;
};

export type ConsultationMessage = {
  id: string;
  role: string;
  content: string;
  inputJson: ConsultationQuestion | Record<string, unknown> | null;
  createdAt: string;
};

async function json<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

export async function startConsultation(input: {
  companyName: string;
  links: string;
  additionalInfo?: string;
}): Promise<{ analysisId: string; guestAccessToken: string }> {
  return json(
    await fetch("/api/consultation/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function getConsultation(
  analysisId: string,
  token: string,
): Promise<{ messages: ConsultationMessage[]; businessIntake: unknown }> {
  return json(
    await fetch(
      `/api/consultation/${analysisId}?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    ),
  );
}

export async function replyConsultation(input: {
  analysisId: string;
  guestAccessToken: string;
  field: string;
  value: string;
}): Promise<void> {
  await json(
    await fetch(`/api/consultation/${input.analysisId}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function confirmConsultation(input: {
  analysisId: string;
  guestAccessToken: string;
}): Promise<{ analysisId: string; jobId: string }> {
  return json(
    await fetch(`/api/consultation/${input.analysisId}/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        guestAccessToken: input.guestAccessToken,
      }),
    }),
  );
}
