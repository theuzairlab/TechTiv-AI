import { z } from "zod";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  addMessage,
  getConversationForViewer,
  listMessages,
  markConversationRead,
} from "@/lib/conversations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const postSchema = z.object({
  body: z.string().trim().min(1).max(8000),
});

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await getConversationForViewer(id, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await markConversationRead(id, session.user.id);
  const messages = await listMessages(id);

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      userId: conversation.userId,
      userName: conversation.user.name,
      userEmail: conversation.user.email,
      companyId: conversation.companyId,
      companyName: conversation.company?.name ?? null,
      relatedLeadId: conversation.relatedLeadId,
      relatedAnalysisId: conversation.relatedAnalysisId,
    },
    messages,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await getConversationForViewer(id, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const message = await addMessage({
    conversationId: id,
    senderUserId: session.user.id,
    body: parsed.data.body,
  });

  return NextResponse.json({ message }, { status: 201 });
}
