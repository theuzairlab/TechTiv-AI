import { prisma } from "@/lib/prisma";

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

  return result.count;
}
