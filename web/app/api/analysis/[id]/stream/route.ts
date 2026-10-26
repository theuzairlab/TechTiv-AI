import { prisma } from "@/lib/prisma";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { RESEARCH_STALL_MS } from "@/lib/analysis/constants";

type Context = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: { guestAccessToken: true, createdAt: true },
  });
  if (!analysis || !verifyGuestAccess(analysis.guestAccessToken, token)) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let cursor = new Date(0);
  let closed = false;
  let lastBeat = analysis.createdAt.getTime();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      };

      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
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
            lastBeat = activity.createdAt.getTime();
            send("activity", {
              ...activity,
              createdAt: activity.createdAt.toISOString(),
            });
          }

          const stalled =
            status != null &&
            status.status !== "DONE" &&
            status.status !== "FAILED" &&
            Date.now() - lastBeat > RESEARCH_STALL_MS;

          send("status", {
            status: status?.status,
            errorMsg: status?.errorMsg ?? null,
            completedAt: status?.completedAt?.toISOString() ?? null,
            emailCaptured: Boolean(status?.emailCapturedAt),
            stalled,
            lastActivityAt: new Date(lastBeat).toISOString(),
          });

          if (status?.status === "DONE" || status?.status === "FAILED" || stalled) {
            if (stalled) {
              send("warning", {
                message:
                  "Research stopped. The worker has not reported back. You can try again.",
              });
            } else {
              send("complete", status);
            }
            finish();
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
        finish();
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
