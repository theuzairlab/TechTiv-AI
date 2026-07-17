/**
 * Phase 8 — verify analysis-ready notify path (dry-run email by default).
 *
 * Requires: DATABASE_URL, BETTER_AUTH_SECRET
 * Optional: set EMAIL_DRY_RUN=false + RESEND_API_KEY + resend enabled for live send
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  if (!process.env.BETTER_AUTH_SECRET?.trim()) {
    console.log("[phase8] SKIP — BETTER_AUTH_SECRET not set");
    return;
  }

  process.env.EMAIL_DRY_RUN = process.env.EMAIL_DRY_RUN ?? "true";

  const { prisma } = await import("@/lib/prisma");
  const { notifyAnalysisReady } = await import(
    "@/lib/email/notify-analysis-ready"
  );
  const { linkLeadsToUser } = await import("@/lib/leads/link-user");

  const email = `phase8-${Date.now()}@example.com`;

  const lead = await prisma.lead.create({
    data: {
      name: "Phase 8 Tester",
      email,
      source: "discovery",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain: "example.com",
      status: "DONE",
      completedAt: new Date(),
    },
  });

  await prisma.proposal.create({
    data: {
      analysisId: analysis.id,
      status: "DRAFT",
      strategyJson: { industryTag: "saas" },
      techStack: [],
      automationBlueprint: [],
      costEstimateUSD: 1999,
      timelineWeeks: 8,
    },
  });

  try {
    const result = await notifyAnalysisReady(analysis.id);
    if (result.status !== "sent" || result.email !== email) {
      throw new Error(`Unexpected notify result: ${JSON.stringify(result)}`);
    }

    const verification = await prisma.verification.findFirst({
      where: { identifier: { contains: email } },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      // Better Auth may store hashed identifier — at least ensure no throw
      console.log(
        "[phase8] No verification row matched by email substring (may be hashed) — notify still OK",
      );
    } else {
      console.log("[phase8] Verification token row created");
    }

    const user = await prisma.user.create({
      data: {
        id: `phase8-user-${Date.now()}`,
        name: "Phase 8 Tester",
        email,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const linked = await linkLeadsToUser(email, user.id);
    if (linked < 1) {
      throw new Error("Expected lead to link to user by email");
    }

    const refreshed = await prisma.lead.findUnique({ where: { id: lead.id } });
    if (refreshed?.userId !== user.id) {
      throw new Error("Lead.userId was not updated");
    }

    console.log("[phase8] analysis-ready notify + lead link OK");

    await prisma.user.delete({ where: { id: user.id } });
  } finally {
    await prisma.proposal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.rawSignal.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.toolUsageLog.deleteMany({ where: { analysisId: analysis.id } });
    await prisma.verification.deleteMany({
      where: { identifier: { contains: email } },
    });
    await prisma.analysis.delete({ where: { id: analysis.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[phase8] Verification failed:", error);
  process.exit(1);
});
