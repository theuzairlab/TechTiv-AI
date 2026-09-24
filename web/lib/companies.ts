import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function companyNameFrom(input: {
  companyName?: string | null;
  personName?: string | null;
  email: string;
}) {
  const fromCompany = input.companyName?.trim();
  if (fromCompany) return fromCompany;
  const fromPerson = input.personName?.trim();
  if (fromPerson) return fromPerson;
  const domain = input.email.split("@")[1];
  return domain || "Unknown company";
}

export async function ensureCompanyForContact(input: {
  email: string;
  companyName?: string | null;
  personName?: string | null;
  domain?: string | null;
  industry?: string | null;
  userId?: string | null;
}): Promise<string> {
  const email = normalizeEmail(input.email);

  if (input.userId) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { companyId: true },
    });
    if (user?.companyId) return user.companyId;
  }

  const existingLead = await prisma.lead.findFirst({
    where: { email, companyId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { companyId: true },
  });
  if (existingLead?.companyId) {
    if (input.userId) {
      await prisma.user.updateMany({
        where: { id: input.userId, companyId: null },
        data: { companyId: existingLead.companyId },
      });
    }
    return existingLead.companyId;
  }

  const domain = input.domain?.trim().toLowerCase() || null;
  if (domain) {
    const byDomain = await prisma.company.findFirst({
      where: { domain },
      select: { id: true },
    });
    if (byDomain) {
      if (input.userId) {
        await prisma.user.updateMany({
          where: { id: input.userId, companyId: null },
          data: { companyId: byDomain.id },
        });
      }
      return byDomain.id;
    }
  }

  const company = await prisma.company.create({
    data: {
      name: companyNameFrom({
        companyName: input.companyName,
        personName: input.personName,
        email,
      }),
      domain,
      industry: input.industry?.trim() || null,
    },
    select: { id: true },
  });

  if (input.userId) {
    await prisma.user.updateMany({
      where: { id: input.userId, companyId: null },
      data: { companyId: company.id },
    });
  }

  return company.id;
}
