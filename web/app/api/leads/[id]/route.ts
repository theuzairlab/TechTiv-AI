import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { updateLeadAdminSchema } from "@/lib/leads";
import { prisma } from "@/lib/prisma";
import { logAdminEvent } from "@/lib/admin/event-log";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const leadSelect = {
  id: true,
  name: true,
  email: true,
  company: true,
  phone: true,
  industry: true,
  interest: true,
  message: true,
  notes: true,
  status: true,
  implementationStatus: true,
  assignedAdminId: true,
  companyId: true,
  source: true,
  discoveryAnswers: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: leadSelect,
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[api/leads/[id]] GET failed:", error);
    return NextResponse.json({ error: "Failed to load lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateLeadAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
        ...(data.implementationStatus !== undefined
          ? { implementationStatus: data.implementationStatus }
          : {}),
        ...(data.assignedAdminId !== undefined
          ? { assignedAdminId: data.assignedAdminId }
          : {}),
        ...(data.companyId !== undefined ? { companyId: data.companyId } : {}),
      },
      select: leadSelect,
    });

    await logAdminEvent({
      adminUserId: auth.session.user.id,
      action: "lead.update",
      targetType: "lead",
      targetId: id,
      metadata: data,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[api/leads/[id]] PATCH failed:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await context.params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/leads/[id]] DELETE failed:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
