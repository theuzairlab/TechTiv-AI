import { NextResponse } from "next/server";
import { z } from "zod";
import { userOwnsAnalysis } from "@/lib/dashboard/analyses";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  reportPublic: z.boolean(),
});

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const owns = await userOwnsAnalysis(id, session.user.id, session.user.email);
  if (!owns) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: { status: true },
  });
  if (analysis?.status !== "DONE") {
    return NextResponse.json(
      { error: "Only a finished blueprint can be made public" },
      { status: 409 },
    );
  }

  const updated = await prisma.analysis.update({
    where: { id },
    data: { reportPublic: parsed.data.reportPublic },
    select: { reportPublic: true },
  });

  return NextResponse.json(updated);
}
