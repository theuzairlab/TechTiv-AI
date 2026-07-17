import { Resend } from "resend";
import { callProvider } from "@/lib/providers";
import {
  analysisReadySubject,
  buildAnalysisReadyHtml,
  buildAnalysisReadyText,
  buildMagicLinkHtml,
  buildMagicLinkText,
  magicLinkSubject,
  type AnalysisReadyEmailParams,
  type MagicLinkEmailParams,
} from "@/lib/email/templates";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "TechTivAI <onboarding@resend.dev>";

function isEmailDryRun(): boolean {
  return (
    process.env.EMAIL_DRY_RUN === "true" ||
    !process.env.RESEND_API_KEY?.trim()
  );
}

async function deliverEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id: string }> {
  if (isEmailDryRun()) {
    console.log(
      `[email dry-run] to=${input.to} subject="${input.subject}"`,
    );
    return { id: "dry-run" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { id: result.data?.id ?? "unknown" };
}

/** Analysis-ready emails are pipeline-related — go through callProvider. */
export async function sendAnalysisReadyEmail(
  params: AnalysisReadyEmailParams,
): Promise<{ id: string }> {
  if (isEmailDryRun()) {
    console.log(
      `[email dry-run] analysis-ready to=${params.to} domain=${params.domain}`,
    );
    return { id: "dry-run" };
  }

  return callProvider({
    provider: "resend",
    endpoint: "emails/analysis-ready",
    analysisId: params.analysisId,
    costEstimateUSD: 0.001,
    creditsOrTokens: 1,
    fn: async () =>
      deliverEmail({
        to: params.to,
        subject: analysisReadySubject(params.domain),
        html: buildAnalysisReadyHtml(params),
        text: buildAnalysisReadyText(params),
      }),
  });
}

/**
 * Magic-link sign-in emails are auth bootstrap (no Analysis row).
 * Uses Resend directly; analysis-ready notifications use callProvider above.
 */
export async function sendMagicLinkEmail(
  params: MagicLinkEmailParams,
): Promise<{ id: string }> {
  return deliverEmail({
    to: params.to,
    subject: magicLinkSubject(),
    html: buildMagicLinkHtml(params),
    text: buildMagicLinkText(params),
  });
}
