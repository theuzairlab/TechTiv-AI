import { createServer, type Server } from "node:http";

export type WorkerHealthState = {
  status: "starting" | "ready" | "error";
  startedAt: string;
  error?: string;
};

function isWakeAuthorized(
  authorization: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return true;
  return authorization === `Bearer ${secret}`;
}

export function startHealthServer(state: WorkerHealthState): Server {
  const port = Number(process.env.PORT ?? 8080);
  const wakeSecret = process.env.WORKER_WAKE_SECRET?.trim();

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://worker.local");

    if (request.method === "GET" && url.pathname === "/health") {
      const healthy = state.status === "ready";
      response.writeHead(healthy ? 200 : 503, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(
        JSON.stringify({
          service: "techtivai-worker",
          ...state,
          uptimeSeconds: Math.round(process.uptime()),
        }),
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/wake") {
      if (
        !isWakeAuthorized(
          request.headers.authorization,
          wakeSecret || undefined,
        )
      ) {
        response.writeHead(401, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      response.writeHead(202, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      response.end(
        JSON.stringify({
          accepted: true,
          workerStatus: state.status,
        }),
      );
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[worker] Health server listening on 0.0.0.0:${port}`);
  });

  return server;
}
