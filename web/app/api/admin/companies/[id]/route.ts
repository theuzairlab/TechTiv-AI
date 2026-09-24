import { z } from "zod";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { getAdminCompanyDetail } from "@/lib/admin/clients";
import { prisma } from "@/lib/prisma";
import { logAdminEvent } from "@/lib/admin/event-log";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  domain: z.string().trim().max(180).nullable().optional(),
  industry: z.string().trim().max(80).nullable().optional(),
  assignedAdminId: z.string().min(1).nullable().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await context.params;
  const company = await getAdminCompanyDetail(id);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  return NextResponse.json({ company });
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

  const data = parsed.data;
  const company = await prisma.company.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.domain !== undefined
        ? { domain: data.domain?.toLowerCase() || null }
        : {}),
      ...(data.industry !== undefined ? { industry: data.industry } : {}),
      ...(data.assignedAdminId !== undefined
        ? { assignedAdminId: data.assignedAdminId }
        : {}),
    },
  });

  if (data.assignedAdminId !== undefined) {
    await prisma.lead.updateMany({
      where: { companyId: id },
      data: { assignedAdminId: data.assignedAdminId },
    });
  }

  await logAdminEvent({
    adminUserId: auth.session.user.id,
    action: "company.update",
    targetType: "company",
    targetId: id,
    metadata: data,
  });

  return NextResponse.json({ company });
}
