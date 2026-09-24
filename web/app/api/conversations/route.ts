import { z } from "zod";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import {
  addMessage,
  findOrCreateConversation,
  listConversations,
} from "@/lib/conversations";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  userId: z.string().min(1).optional(),
  relatedLeadId: z.string().min(1).optional(),
  relatedAnalysisId: z.string().min(1).optional(),
  body: z.string().trim().min(1).max(8000).optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopeParam = new URL(request.url).searchParams.get("scope");
  const scope =
    scopeParam === "own" || scopeParam === "inbox" ? scopeParam : undefined;

  const conversations = await listConversations({
    userId: session.user.id,
    role: session.user.role,
    scope,
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const admin = isAdmin(session.user.role);
  let clientUserId = session.user.id;
  let companyId: string | null = null;

  if (admin) {
    if (!parsed.data.userId) {
      return NextResponse.json(
        { error: "Select a client to message" },
        { status: 400 },
      );
    }
    clientUserId = parsed.data.userId;
  }

  const client = await prisma.user.findUnique({
    where: { id: clientUserId },
    select: { id: true, companyId: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  companyId = client.companyId;

  if (parsed.data.relatedLeadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: parsed.data.relatedLeadId },
      select: { userId: true, email: true, companyId: true },
    });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (!admin && lead.userId !== session.user.id && lead.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    companyId = lead.companyId ?? companyId;
  }

  const conversation = await findOrCreateConversation({
    clientUserId,
    createdById: session.user.id,
    companyId,
    relatedLeadId: parsed.data.relatedLeadId ?? null,
    relatedAnalysisId: parsed.data.relatedAnalysisId ?? null,
  });

  if (parsed.data.body) {
    await addMessage({
      conversationId: conversation.id,
      senderUserId: session.user.id,
      body: parsed.data.body,
    });
  }

  return NextResponse.json({ id: conversation.id }, { status: 201 });
}
