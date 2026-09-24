import { prisma } from "@/lib/prisma";
import { ensureCompanyForContact } from "@/lib/companies";

/** Attach any leads with this email to the Better Auth user (idempotent). */
export async function linkLeadsToUser(
  email: string,
  userId: string,
): Promise<number> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !userId) return 0;

  const result = await prisma.lead.updateMany({
    where: {
      email: normalized,
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });

  const lead = await prisma.lead.findFirst({
    where: { email: normalized, companyId: { not: null } },
    select: { companyId: true, company: true, industry: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const companyId =
    lead?.companyId ??
    (await ensureCompanyForContact({
      email: normalized,
      userId,
      personName: lead?.name,
      companyName: lead?.company,
      industry: lead?.industry,
    }));

  await prisma.user.updateMany({
    where: { id: userId, companyId: null },
    data: { companyId },
  });
  await prisma.lead.updateMany({
    where: { email: normalized, companyId: null },
    data: { companyId },
  });

  return result.count;
}
