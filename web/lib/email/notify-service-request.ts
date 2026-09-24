import { sendServiceRequestNotification } from "@/lib/email/send";

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function adminRecipients(): string[] {
  return (process.env.ADMIN_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export type ServiceRequestNotifyResult = {
  status: "sent" | "skipped";
  recipients: string[];
};

/**
 * Best-effort admin alert when a client submits "Build This With TechTivAI".
 * Skips silently if ADMIN_NOTIFICATION_EMAIL isn't configured — never throws
 * in a way that should block lead creation; callers should still wrap in try/catch.
 */
export async function notifyServiceRequestReceived(input: {
  leadId: string;
  name: string;
  email: string;
  metadata: unknown;
}): Promise<ServiceRequestNotifyResult> {
  const recipients = adminRecipients();
  if (recipients.length === 0) {
    return { status: "skipped", recipients: [] };
  }

  const metadata = asObject(input.metadata) ?? {};
  const service = asString(metadata.service) ?? "Requested service";
  const domain = asString(metadata.analysisDomain);
  const problem = asString(metadata.problem);
  const estimatedScope = asString(metadata.estimatedScope);
  const estimatedTimelineWeeks = asNumber(metadata.estimatedTimelineWeeks);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await Promise.all(
    recipients.map((to) =>
      sendServiceRequestNotification(to, {
        clientName: input.name,
        clientEmail: input.email,
        service,
        domain,
        problem,
        estimatedScope,
        estimatedTimelineWeeks,
        adminUrl: `${appUrl}/admin/leads?lead=${input.leadId}`,
      }),
    ),
  );

  return { status: "sent", recipients };
}
