# TechTivAI Worker Service

Long-running Node.js worker that consumes analysis jobs from Redis (BullMQ) and runs the analysis pipeline.

## Architecture

- **Queue:** BullMQ + Redis (`analysis-jobs` queue)
- **Database:** Shared Neon Postgres via Prisma (same schema as `web/`)
- **Deploy target:** Render/Koyeb web service or a persistent VPS
- **HTTP endpoints:** `GET /health`, authenticated `POST /wake`

## Schema Sync Rule

**Never edit `backend/prisma/schema.prisma` directly.**

1. Edit `web/prisma/schema.prisma`
2. Run migrations in `web/`: `npm run db:migrate`
3. Copy schema to backend:
   ```bash
   cp ../web/prisma/schema.prisma prisma/schema.prisma
   ```
4. Update the `output` path in the copied schema if needed (backend uses `../src/generated/prisma`)
5. Regenerate client: `npm run db:generate`

## Setup

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL (same Neon DB as web) and REDIS_URL
npm install
npm run db:generate
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start worker with hot reload |
| `npm run health` | Verify Redis + DB connectivity |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled worker |
| `npm run db:generate` | Regenerate Prisma client |

## Local Development

Requires local Redis running (`redis-cli ping` → `PONG`).

```bash
npm run health   # verify connections
npm run dev      # start consumer
```

## Render Free Demo Deployment

Create a **Web Service** with:

```text
Root directory: backend
Build command: npm install && npm run db:generate && npm run build
Start command: npm start
Health check path: /health
```

Set `DATABASE_URL` to the same hosted Postgres database used by Vercel and
`REDIS_URL` to a TCP/TLS Redis URL such as `rediss://...` from Upstash. Add all
pipeline provider keys, `WEB_APP_URL`, `INTERNAL_API_SECRET`, and a random
`WORKER_WAKE_SECRET`.

In Vercel, set:

```text
WORKER_WAKE_URL=https://your-worker.onrender.com
WORKER_WAKE_SECRET=<same value as Render>
REDIS_URL=<same Redis database as Render>
```

Every analysis and consultation enqueue sends a best-effort `POST /wake`.
This wakes a sleeping free Render service; the BullMQ job remains safely queued
until the worker connects. A free service can have a cold start, so the first
response after inactivity may take around a minute.

## Phase 0 Status

- [x] Project scaffold
- [x] Prisma client setup (shared schema copy)
- [x] Redis + BullMQ worker skeleton
- [x] Startup health checks
- [x] Queue consume test (`npm run test:enqueue`)
- [x] Pipeline stub orchestrator (Phase 4)
- [x] Real audit providers wired (Phase 5 — Firecrawl, PageSpeed, DetectZeStack, Tavily, SerpAPI)
- [x] Claude synthesis with structured JSON (Phase 6)
- [ ] Deterministic pricing engine (Phase 7+)
