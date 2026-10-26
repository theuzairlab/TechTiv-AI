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
  const text = await response.text();
  let body: (T & { error?: string }) | null = null;
  if (text.trim()) {
    try {
      body = JSON.parse(text) as T & { error?: string };
    } catch {
      throw new Error("The server returned an unreadable response. Try again.");
    }
  }
  if (!response.ok) {
    throw new Error(body?.error ?? "The research worker is not available right now. Try again.");
  }
  if (!body) {
    throw new Error("The server returned an empty response. Try again.");
  }
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

export type PublicReportLink = {
  analysisId: string;
  completedAt: string;
  href: string;
};

export async function fetchResearchGate(input: {
  analysisId: string;
  guestAccessToken: string;
}): Promise<{
  status: "allow" | "email_required" | "payment_required" | "paid";
  email?: string;
  existingPublicReport: PublicReportLink | null;
}> {
  const response = await fetch(`/api/consultation/${input.analysisId}/gate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ guestAccessToken: input.guestAccessToken }),
  });
  const body = (await response.json()) as {
    status?: "allow" | "email_required" | "payment_required" | "paid";
    email?: string;
    existingPublicReport?: PublicReportLink | null;
    error?: string;
  };
  if (!response.ok || !body.status) {
    throw new Error(body.error ?? "Could not check this analysis");
  }
  return {
    status: body.status,
    email: body.email,
    existingPublicReport: body.existingPublicReport ?? null,
  };
}

export async function confirmConsultation(input: {
  analysisId: string;
  guestAccessToken: string;
  email?: string;
}): Promise<
  | { status: "queued"; analysisId: string; jobId: string }
  | { status: "email_required" }
  | { status: "payment_required"; email: string }
  | { status: "cached"; analysisId: string; completedAt: string; message: string }
> {
  const response = await fetch(`/api/consultation/${input.analysisId}/confirm`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      guestAccessToken: input.guestAccessToken,
      email: input.email,
    }),
  });
  const body = (await response.json()) as {
    status?: string;
    analysisId?: string;
    jobId?: string;
    email?: string;
    completedAt?: string;
    message?: string;
    error?: string;
  };
  if (body.status === "email_required") return { status: "email_required" };
  if (body.status === "payment_required" && body.email) {
    return { status: "payment_required", email: body.email };
  }
  if (
    body.status === "cached" &&
    body.analysisId &&
    body.completedAt &&
    body.message
  ) {
    return {
      status: "cached",
      analysisId: body.analysisId,
      completedAt: body.completedAt,
      message: body.message,
    };
  }
  if (!response.ok || !body.analysisId || !body.jobId) {
    throw new Error(body.error ?? "Could not start research");
  }
  return { status: "queued", analysisId: body.analysisId, jobId: body.jobId };
}
