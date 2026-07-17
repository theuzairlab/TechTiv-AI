import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const [newLeadsCount, recentLeads] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      newLeadsCount,
      recentLeads: recentLeads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[api/admin/notifications] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 },
    );
  }
}
