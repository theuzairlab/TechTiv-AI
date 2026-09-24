import { prisma } from "@/lib/prisma";
import { userOwnsAnalysis } from "@/lib/dashboard/analyses";

export async function requireOwnedAnalysis(options: {
  analysisId: string;
  userId: string;
  email: string;
}) {
  const owns = await userOwnsAnalysis(
    options.analysisId,
    options.userId,
    options.email,
  );
  if (!owns) return null;
  return prisma.analysis.findUnique({
    where: { id: options.analysisId },
    select: { id: true, domain: true, status: true },
  });
}

export async function getOrCreateConsultantSession(options: {
  userId: string;
  analysisId: string;
}) {
  return prisma.consultantSession.upsert({
    where: {
      userId_analysisId: {
        userId: options.userId,
        analysisId: options.analysisId,
      },
    },
    create: {
      userId: options.userId,
      analysisId: options.analysisId,
    },
    update: { status: "ACTIVE" },
  });
}
