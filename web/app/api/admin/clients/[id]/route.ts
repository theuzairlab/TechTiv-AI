import { z } from "zod";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { getAdminClientDetail } from "@/lib/admin/clients";
import { prisma } from "@/lib/prisma";
import { logAdminEvent } from "@/lib/admin/event-log";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  companyId: z.string().min(1).nullable().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await context.params;
  const client = await getAdminClientDetail(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ client });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.companyId !== undefined
        ? { companyId: parsed.data.companyId }
        : {}),
    },
    select: { id: true, companyId: true },
  });

  if (parsed.data.companyId) {
    await prisma.lead.updateMany({
      where: { userId: id, companyId: null },
      data: { companyId: parsed.data.companyId },
    });
  }

  await logAdminEvent({
    adminUserId: auth.session.user.id,
    action: "client.update",
    targetType: "user",
    targetId: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ user });
}
