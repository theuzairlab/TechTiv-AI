import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createLeadSchema } from "@/lib/leads";
import { requireAdminApi } from "@/lib/leads-api";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

function toJsonValue(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (!value) return undefined;
  return value as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

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
    const session = await getSession();

    const metadata = {
      ...(data.budget ? { budget: data.budget } : {}),
      ...(data.metadata ?? {}),
    };

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        company: data.company || null,
        phone: data.phone || null,
        industry: data.industry || null,
        interest: data.interest || null,
        message: data.message || null,
        source: data.source,
        userId: session?.user.id ?? null,
        discoveryAnswers: toJsonValue(data.discoveryAnswers),
        metadata: toJsonValue(
          Object.keys(metadata).length > 0 ? metadata : undefined,
        ),
      },
      select: { id: true },
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("[api/leads] POST failed:", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
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
        source: true,
        discoveryAnswers: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[api/leads] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load leads" },
      { status: 500 },
    );
  }
}
