import { prisma } from "@/lib/prisma";
import type { ImplementationStatus } from "@/lib/implementation";
import type { LeadStatus } from "@/lib/leads";

export type AdminClientListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  companyId: string | null;
  companyName: string | null;
  leadCount: number;
  analysisCount: number;
  lastActivityAt: string | null;
};

export type AdminClientDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    assignedAdminId: string | null;
    assignedAdminName: string | null;
  } | null;
  leads: Array<{
    id: string;
    name: string;
    source: string;
    status: LeadStatus;
    implementationStatus: ImplementationStatus | null;
    assignedAdminId: string | null;
    assignedAdminName: string | null;
    createdAt: string;
  }>;
  analyses: Array<{
    id: string;
    domain: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
  }>;
  conversations: Array<{
    id: string;
    lastMessageAt: string;
    relatedLeadId: string | null;
  }>;
};

export async function listAdminClients(search?: string): Promise<AdminClientListItem[]> {
  const query = search?.trim();
  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      companyId: true,
      company: { select: { name: true } },
      leads: {
        select: {
          id: true,
          createdAt: true,
          analyses: { select: { id: true, createdAt: true } },
        },
      },
    },
  });

  return users.map((user) => {
    const analysisCount = user.leads.reduce(
      (sum, lead) => sum + lead.analyses.length,
      0,
    );
    const lastLead = user.leads
      .map((lead) => lead.createdAt)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const lastAnalysis = user.leads
      .flatMap((lead) => lead.analyses.map((item) => item.createdAt))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const lastActivityAt =
      lastLead && lastAnalysis
        ? lastLead > lastAnalysis
          ? lastLead
          : lastAnalysis
        : (lastLead ?? lastAnalysis ?? user.createdAt);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      companyId: user.companyId,
      companyName: user.company?.name ?? null,
      leadCount: user.leads.length,
      analysisCount,
      lastActivityAt: lastActivityAt.toISOString(),
    };
  });
}

export async function getAdminClientDetail(
  userId: string,
): Promise<AdminClientDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: {
          assignedAdmin: { select: { id: true, name: true } },
        },
      },
      leads: {
        orderBy: { createdAt: "desc" },
        include: {
          assignedAdmin: { select: { name: true } },
          analyses: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              domain: true,
              status: true,
              createdAt: true,
              completedAt: true,
            },
          },
        },
      },
      clientConversations: {
        orderBy: { lastMessageAt: "desc" },
        select: {
          id: true,
          lastMessageAt: true,
          relatedLeadId: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          domain: user.company.domain,
          industry: user.company.industry,
          assignedAdminId: user.company.assignedAdminId,
          assignedAdminName: user.company.assignedAdmin?.name ?? null,
        }
      : null,
    leads: user.leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      source: lead.source,
      status: lead.status,
      implementationStatus: lead.implementationStatus,
      assignedAdminId: lead.assignedAdminId,
      assignedAdminName: lead.assignedAdmin?.name ?? null,
      createdAt: lead.createdAt.toISOString(),
    })),
    analyses: user.leads.flatMap((lead) =>
      lead.analyses.map((analysis) => ({
        id: analysis.id,
        domain: analysis.domain,
        status: analysis.status,
        createdAt: analysis.createdAt.toISOString(),
        completedAt: analysis.completedAt?.toISOString() ?? null,
      })),
    ),
    conversations: user.clientConversations.map((row) => ({
      id: row.id,
      lastMessageAt: row.lastMessageAt.toISOString(),
      relatedLeadId: row.relatedLeadId,
    })),
  };
}

export async function listAdminCompanies(search?: string) {
  const query = search?.trim();
  const rows = await prisma.company.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { domain: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      assignedAdmin: { select: { id: true, name: true } },
      _count: { select: { users: true, leads: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    domain: row.domain,
    industry: row.industry,
    assignedAdminId: row.assignedAdminId,
    assignedAdminName: row.assignedAdmin?.name ?? null,
    userCount: row._count.users,
    leadCount: row._count.leads,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAdminCompanyDetail(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      assignedAdmin: { select: { id: true, name: true, email: true } },
      users: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
      leads: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          source: true,
          status: true,
          implementationStatus: true,
          createdAt: true,
          analyses: {
            select: { id: true, domain: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!company) return null;

  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    industry: company.industry,
    assignedAdminId: company.assignedAdminId,
    assignedAdmin: company.assignedAdmin,
    createdAt: company.createdAt.toISOString(),
    users: company.users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })),
    leads: company.leads.map((lead) => ({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      analyses: lead.analyses.map((analysis) => ({
        ...analysis,
        createdAt: analysis.createdAt.toISOString(),
      })),
    })),
  };
}

export async function listAdminAssignees() {
  return prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}
