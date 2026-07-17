export type AnalysisReadyEmailParams = {
  to: string;
  name: string;
  domain: string;
  analysisId: string;
  magicLinkUrl: string;
  costEstimateUSD?: number | null;
  timelineWeeks?: number | null;
};

export type MagicLinkEmailParams = {
  to: string;
  magicLinkUrl: string;
};

export function analysisReadySubject(domain: string): string {
  return `Your TechTivAI blueprint for ${domain} is ready`;
}

export function magicLinkSubject(): string {
  return "Your TechTivAI sign-in link";
}

export function buildAnalysisReadyHtml(params: AnalysisReadyEmailParams): string {
  const costLine =
    params.costEstimateUSD != null
      ? `<p style="margin:0 0 8px;color:#334155;font-size:15px;">Estimated investment: <strong>$${params.costEstimateUSD.toLocaleString()}</strong></p>`
      : "";
  const timelineLine =
    params.timelineWeeks != null
      ? `<p style="margin:0 0 24px;color:#334155;font-size:15px;">Estimated timeline: <strong>${params.timelineWeeks} weeks</strong></p>`
      : `<p style="margin:0 0 24px;"></p>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 16px;background:linear-gradient(135deg,#06b6d4,#84cc16);">
              <p style="margin:0;color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">TechTivAI</p>
              <h1 style="margin:12px 0 0;color:#0f172a;font-size:24px;line-height:1.3;">Your blueprint is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hi ${escapeHtml(params.name)},</p>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
                We’ve finished analyzing <strong>${escapeHtml(params.domain)}</strong>.
                Your personalized AI transformation blueprint is waiting in your portal.
              </p>
              ${costLine}
              ${timelineLine}
              <a href="${escapeHtml(params.magicLinkUrl)}"
                 style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:10px;">
                View your blueprint
              </a>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
                This secure link signs you in automatically and expires after a short time.
                If you didn’t request this analysis, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAnalysisReadyText(params: AnalysisReadyEmailParams): string {
  const lines = [
    `Hi ${params.name},`,
    "",
    `Your TechTivAI blueprint for ${params.domain} is ready.`,
  ];

  if (params.costEstimateUSD != null) {
    lines.push(`Estimated investment: $${params.costEstimateUSD.toLocaleString()}`);
  }
  if (params.timelineWeeks != null) {
    lines.push(`Estimated timeline: ${params.timelineWeeks} weeks`);
  }

  lines.push(
    "",
    `View your blueprint (magic sign-in link):`,
    params.magicLinkUrl,
    "",
    "This link expires after a short time.",
  );

  return lines.join("\n");
}

export function buildMagicLinkHtml(params: MagicLinkEmailParams): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">TechTivAI</p>
              <h1 style="margin:0 0 16px;color:#0f172a;font-size:22px;">Sign in to your portal</h1>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                Click the button below to sign in securely. No password needed.
              </p>
              <a href="${escapeHtml(params.magicLinkUrl)}"
                 style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:10px;">
                Sign in
              </a>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
                If you didn’t request this link, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildMagicLinkText(params: MagicLinkEmailParams): string {
  return [
    "Sign in to TechTivAI",
    "",
    "Use this secure link to sign in (no password needed):",
    params.magicLinkUrl,
    "",
    "If you didn’t request this, ignore this email.",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
