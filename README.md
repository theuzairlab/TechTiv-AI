# TechTivAI

TechTivAI is an AI business-intelligence and transformation platform. It
combines an adaptive Claude consultation, evidence-first market research,
technical auditing, deterministic pricing, and a decision-grade Report V2.

This repository is a monorepo containing the Next.js application and the
long-running BullMQ analysis worker.

## Repository structure

```text
.
├── web/       Next.js application, API routes, dashboard, Prisma migrations
├── backend/   BullMQ worker, provider integrations, synthesis and pricing
└── scripts/   Shared development and Prisma schema synchronization scripts
```

The Prisma schema in `web/prisma/schema.prisma` is the source of truth. The
backend client is generated from a synchronized copy.

## Architecture

```text
Browser
  │
  ▼
Next.js on Vercel
  ├── PostgreSQL (users, analyses, evidence, reports)
  ├── BullMQ enqueue
  └── POST /wake to the worker
         │
         ▼
Redis / Upstash
         │
         ▼
Node.js worker on Render/Koyeb/VPS
  ├── Firecrawl
  ├── PageSpeed and DetectZeStack
  ├── Tavily and SerpAPI
  ├── Claude synthesis
  └── Report, pricing and notification persistence
```

The browser does not connect directly to the worker. The worker writes
normalized activities and statuses to PostgreSQL; the web application streams
them to the browser through SSE with a polling fallback.

## Main features

- Adaptive Claude business consultation
- Single-column agentic research transcript
- Deferred email capture and guest access
- Bounded multi-page website crawling
- Social, leadership, competitor and visibility discovery
- Normalized evidence with entity confidence and stable citations
- Retry-isolated analysis runs
- Coverage and grounding validation
- Evidence-backed Report V2
- Deterministic scope pricing and conditional ROI
- Dashboard, teaser report and branded PDF
- Admin analysis, provider, lead and audit management
- Resilient provider handling and partial-report fallback

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL
- Redis compatible with BullMQ
- Provider API keys for the live analysis pipeline

For local development, PostgreSQL and Redis can run locally. For deployment,
use a hosted PostgreSQL database and a Redis TCP/TLS URL such as an Upstash
`rediss://` connection string.

## Local setup

### 1. Configure the web application

```bash
cd web
cp .env.example .env
npm install
npm run db:generate
npm run build
```

Set at minimum:

```text
DATABASE_URL
REDIS_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
INTERNAL_API_SECRET
```

For live email delivery, also configure:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
EMAIL_DRY_RUN=false
```

`RESEND_FROM_EMAIL` must use a verified domain for production recipients.

### 2. Configure the worker

```bash
cd ../backend
cp .env.example .env
npm install
npm run db:generate
npm run build
```

The worker must use the same `DATABASE_URL`, `REDIS_URL`, and
`INTERNAL_API_SECRET` as the web application. Add the external provider keys
listed in `backend/.env.example`.

### 3. Apply migrations

The web project owns database migrations:

```bash
cd web
npx prisma migrate deploy
```

When the Prisma schema changes:

```bash
./scripts/sync-prisma-schema.sh
```

### 4. Start development services

In separate terminals:

```bash
cd web
npm run dev
```

```bash
cd backend
npm run dev
```

The web application runs at `http://localhost:3000`. The worker health endpoint
runs at `http://localhost:8080/health`.

## Verification

```bash
cd web
npm test
npm run build
```

```bash
cd backend
npm test
npm run build
```

## Deployment

### Web application — Vercel

Create a Vercel project with `web` as the root directory. Configure the web
environment variables from `web/.env.example`.

### Worker — Render free web service

Create a Render **Web Service**:

```text
Root directory: backend
Build command: npm install && npm run db:generate && npm run build
Start command: npm start
Health check path: /health
```

Configure the worker variables from `backend/.env.example`, including:

```text
DATABASE_URL
REDIS_URL
WEB_APP_URL
INTERNAL_API_SECRET
WORKER_WAKE_SECRET
ANTHROPIC_API_KEY
FIRECRAWL_API_KEY
PAGESPEED_API_KEY
DETECTZESTACK_API_KEY
TAVILY_API_KEY
SERPAPI_KEY
```

Then add these variables to Vercel:

```text
WORKER_WAKE_URL=https://your-worker.onrender.com
WORKER_WAKE_SECRET=<same secret configured on Render>
REDIS_URL=<same Redis database used by the worker>
```

Every enqueue sends a best-effort `POST /wake`. A free Render service may take
approximately one minute to cold-start, but the BullMQ job remains queued until
the worker connects.

For reliable production processing, use a persistent paid worker or VPS.

## Security

- Never commit `.env` or `.env.local` files.
- Keep provider keys in Vercel/Render environment settings.
- Use a strong, matching `INTERNAL_API_SECRET` across web and worker.
- Use a separate strong `WORKER_WAKE_SECRET`.
- Rotate any credential that has previously been committed or shared publicly.

## License

Private project. Add a license before distributing the source publicly.
