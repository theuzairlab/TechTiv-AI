import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export type ConversationListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyId: string | null;
  companyName: string | null;
  relatedLeadId: string | null;
  relatedAnalysisId: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
};

export type ConversationMessage = {
  id: string;
  senderUserId: string;
  senderName: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function previewFrom(body: string) {
  const trimmed = body.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 137)}…` : trimmed;
}

export type ConversationInboxScope = "own" | "inbox";

function isAdminInboxScope(
  role?: string | null,
  scope?: ConversationInboxScope,
) {
  if (scope === "own") return false;
  if (scope === "inbox") return true;
  return isAdmin(role);
}

export async function countUnreadMessages(options: {
  userId: string;
  role?: string | null;
  scope?: ConversationInboxScope;
}) {
  if (isAdminInboxScope(options.role, options.scope)) {
    return prisma.message.count({
      where: {
        readAt: null,
        senderUserId: { not: options.userId },
      },
    });
  }

  return prisma.message.count({
    where: {
      readAt: null,
      senderUserId: { not: options.userId },
      conversation: { userId: options.userId },
    },
  });
}

export async function listConversations(options: {
  userId: string;
  role?: string | null;
  scope?: ConversationInboxScope;
}): Promise<ConversationListItem[]> {
  const admin = isAdminInboxScope(options.role, options.scope);
  const rows = await prisma.conversation.findMany({
    where: admin ? undefined : { userId: options.userId },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      company: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  const unreadGroups = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      readAt: null,
      senderUserId: { not: options.userId },
      conversationId: { in: rows.map((row) => row.id) },
    },
    _count: { _all: true },
  });
  const unreadById = new Map(
    unreadGroups.map((row) => [row.conversationId, row._count._all]),
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    companyId: row.companyId,
    companyName: row.company?.name ?? null,
    relatedLeadId: row.relatedLeadId,
    relatedAnalysisId: row.relatedAnalysisId,
    lastMessageAt: row.lastMessageAt.toISOString(),
    lastMessagePreview: row.messages[0] ? previewFrom(row.messages[0].body) : null,
    unreadCount: unreadById.get(row.id) ?? 0,
  }));
}

export async function getConversationForViewer(
  conversationId: string,
  viewer: { userId: string; role?: string | null },
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
  });

  if (!conversation) return null;
  if (!isAdmin(viewer.role) && conversation.userId !== viewer.userId) {
    return null;
  }

  return conversation;
}

export async function listMessages(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    senderUserId: row.senderUserId,
    senderName: row.sender.name,
    body: row.body,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markConversationRead(
  conversationId: string,
  viewerUserId: string,
) {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderUserId: { not: viewerUserId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function createConversation(input: {
  clientUserId: string;
  createdById: string;
  companyId?: string | null;
  relatedLeadId?: string | null;
  relatedAnalysisId?: string | null;
}) {
  return prisma.conversation.create({
    data: {
      userId: input.clientUserId,
      createdById: input.createdById,
      companyId: input.companyId ?? null,
      relatedLeadId: input.relatedLeadId ?? null,
      relatedAnalysisId: input.relatedAnalysisId ?? null,
    },
    select: { id: true },
  });
}

export async function findOrCreateConversation(input: {
  clientUserId: string;
  createdById: string;
  companyId?: string | null;
  relatedLeadId?: string | null;
  relatedAnalysisId?: string | null;
}) {
  const existing = await prisma.conversation.findFirst({
    where: {
      userId: input.clientUserId,
      ...(input.relatedLeadId
        ? { relatedLeadId: input.relatedLeadId }
        : input.relatedAnalysisId
          ? { relatedAnalysisId: input.relatedAnalysisId }
          : { relatedLeadId: null, relatedAnalysisId: null }),
    },
    orderBy: { lastMessageAt: "desc" },
    select: { id: true },
  });

  if (existing) return existing;

  return createConversation(input);
}

export async function addMessage(input: {
  conversationId: string;
  senderUserId: string;
  body: string;
}) {
  const body = input.body.trim();
  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderUserId: input.senderUserId,
      body,
    },
    include: { sender: { select: { name: true } } },
  });

  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  return {
    id: message.id,
    senderUserId: message.senderUserId,
    senderName: message.sender.name,
    body: message.body,
    readAt: message.readAt?.toISOString() ?? null,
    createdAt: message.createdAt.toISOString(),
  } satisfies ConversationMessage;
}
