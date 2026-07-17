import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";

type Context = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: { guestAccessToken: true },
  });
  if (!analysis || !verifyGuestAccess(analysis.guestAccessToken, token)) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let cursor = new Date(0);
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const tick = async () => {
        if (closed) return;
        try {
          const [status, activities] = await Promise.all([
            prisma.analysis.findUnique({
              where: { id },
              select: {
                status: true,
                errorMsg: true,
                completedAt: true,
                emailCapturedAt: true,
              },
            }),
            prisma.analysisActivity.findMany({
              where: { analysisId: id, createdAt: { gt: cursor } },
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              take: 100,
            }),
          ]);

          for (const activity of activities) {
            cursor = activity.createdAt;
            send("activity", {
              ...activity,
              createdAt: activity.createdAt.toISOString(),
            });
          }
          send("status", {
            ...status,
            completedAt: status?.completedAt?.toISOString() ?? null,
            emailCaptured: Boolean(status?.emailCapturedAt),
          });

          if (status?.status === "DONE" || status?.status === "FAILED") {
            send("complete", status);
            controller.close();
            closed = true;
            return;
          }
        } catch (error) {
          send("warning", {
            message: error instanceof Error ? error.message : "Stream error",
          });
        }
        if (!closed) setTimeout(tick, 1200);
      };

      request.signal.addEventListener("abort", () => {
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
      send("connected", { analysisId: id });
      await tick();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
