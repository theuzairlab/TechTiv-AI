# TechTivAI Phase 2 — Full System Plan

This is the production roadmap. Each phase has a build -> test -> gate cycle. Nothing moves forward until the gate passes. The north star docs describe the full vision; this plan is the literal build order.

## System Map (What We Are Building)

Visitor (`/discovery`) submits website, social links, and email.  
Next.js route validates input, runs dedup/rate-limit checks, writes DB rows, enqueues a Redis/BullMQ job, and returns immediately.  
A separate long-running Node worker on Hetzner consumes the job and executes:

1. Firecrawl crawl
2. PageSpeed audit
3. DetectZeStack stack detection
4. Tavily/SerpAPI competitor signals
5. Claude synthesis (structured JSON only)
6. Deterministic pricing engine (pure function, no LLM pricing)
7. Claude narrative generation around deterministic numbers
8. Puppeteer PDF generation
9. Cloudflare R2 upload

Then it updates status/results in Neon Postgres and sends a "ready" email.  
User logs in with magic link and sees/downloads blueprint in dashboard.

### Hard Rules

- Next.js never runs pipeline logic (enqueue/read only).
- Every external API/LLM call goes through one shared wrapper.
- LLM never generates cost/timeline directly.
- One tool per category only (no fallback providers unless explicitly requested).
- Schema source of truth is `web/prisma/schema.prisma`, then copied to backend.

## Locked Decisions

- Schema ownership: `web/prisma/schema.prisma`
- Schema sync strategy: manual copy to backend before worker deploy
- Migration owner: `web/` (already runs Prisma migrate deploy in build)
- Local Redis dev: local install (`localhost:6379`)
- Worker location: `backend/`

## Phase 0 — Infrastructure Prep

**Status: COMPLETE**

### Goal

Ensure both web and worker can connect to the same Neon DB and Redis queue before business logic.

### Build

1. Add provider/env contracts to:
   - `web/.env.example`
   - `backend/.env.example`
2. Confirm local Redis is reachable.
3. Scaffold `backend/` Node + TypeScript worker skeleton.
4. Add Prisma setup in backend and first schema sync copy.
5. Add backend README with schema sync rule.

### Test Gate

- [x] `redis-cli ping` returns `PONG`
- [x] `web` and `backend` both run Prisma generate
- [x] backend process starts and can connect to DB + Redis
- [x] test job enqueued and consumed by worker

## Phase 1 — Prisma Schema (Pipeline Models)

**Status: COMPLETE**

### Goal

Add: `AnalyzedDomain`, `Analysis`, `RawSignal`, `Proposal`, `ProviderConfig`, `ToolUsageLog`, plus relation from existing `Lead`.

### Build

1. Update `web/prisma/schema.prisma`
2. Run migration (`add_analysis_pipeline_models`)
3. Seed provider config rows
4. Copy schema to backend and regenerate backend Prisma client

### Test Gate

- [x] Migration succeeds
- [x] New tables visible in Prisma Studio
- [x] Existing lead/auth data unaffected
- [x] ProviderConfig seeded (7 providers, all disabled)
- [x] Schema synced to backend + Prisma client regenerated

## Phase 2 — Shared External Call Wrapper

**Status: COMPLETE**

### Goal

Single wrapper for all API/LLM calls with budget/enable checks + usage logging.

### Build

1. Implement `callProvider()` abstraction
2. Check `ProviderConfig.isEnabled` and budget before call
3. Log `ToolUsageLog` after call with latency, cost, status
4. Add error classes for disabled/budget exceeded

### Test Gate

- [x] Disabled provider blocks call and logs correctly
- [x] Budget exceeded blocks call and logs correctly
- [x] Success increments spend + logs
- [x] Failure logs correctly without spend increment
- [x] Zero budget treated as unlimited (pagespeed)

## Phase 3 — Next.js `/api/analysis` Enqueue Route

**Status: COMPLETE**

### Goal

Validate intake, dedup/rate-limit checks, DB writes, enqueue job, return immediately.

### Build

1. Zod schema for analysis request
2. Domain normalization utility
3. Dedup logic (`AnalyzedDomain`)
4. Email-based rolling free-tier rate limit
5. Create/update `Lead`, create `Analysis`, upsert `AnalyzedDomain`
6. Enqueue BullMQ job

### Test Gate

- [x] New valid analysis enqueues successfully
- [x] Processing dedup path works (no duplicate jobs)
- [x] Freshness-window dedup path works (cached response shape)
- [x] Free-tier rate-limit path works
- [x] GET `/api/analysis/[id]` status route added

## Phase 4 — Worker Skeleton (BullMQ Consumer)

**Status: COMPLETE**

### Goal

Consume jobs, move `Analysis.status` through each stage, stub each step.

### Build

1. Worker bootstrap + graceful shutdown
2. Pipeline orchestrator with status transitions
3. Stub step files for each stage
4. Failure handling + retries baseline

### Test Gate

- [x] Worker picks queue jobs
- [x] Status transitions visible in DB
- [x] Failure updates `FAILED` with error details
- [x] `AnalyzedDomain` released on failure (domain lock cleared)
- [x] 9 stub `RawSignal` rows written on success path

## Phase 5 — Provider Wiring in Isolation, Then Chain

**Status: COMPLETE (implementation)** — run `npm run test:providers` with API keys in `backend/.env` to verify live calls.

### Order

1. Firecrawl
2. PageSpeed
3. DetectZeStack
4. Tavily/SerpAPI

### Rule

Each provider must pass isolation tests before chaining into full run.

### Test Gate

- [x] Firecrawl provider module + crawl step wired via `callProvider`
- [x] PageSpeed provider module + audit step wired
- [x] DetectZeStack provider module + audit step wired (replaces Wappalyzer for dev free tier)
- [x] Tavily + SerpAPI provider modules + competitors step wired
- [x] `PIPELINE_USE_STUBS=true` preserves Phase 4 pipeline tests without keys
- [x] `npm run test:providers` isolation script (skips providers without API keys)

## Phase 6 — Claude Synthesis (Structured JSON Only)

**Status: COMPLETE**

### Goal

Generate strict schema-validated structured output from raw signals.

### Build

1. Define synthesis JSON schema (Zod)
2. Prompt Claude for JSON-only response
3. Validate parse, retry policy on invalid output
4. Persist structured outputs to proposal-related fields

### Test Gate

- [x] Synthesis Zod schema defined and unit tested
- [x] Claude provider wired via `callProvider` with token/cost logging
- [x] JSON-only prompt + parse retry on invalid output
- [x] `Proposal.strategyJson`, `techStack`, `automationBlueprint` persisted
- [x] No cost/timeline fields in Claude synthesis output
- [x] `npm run test:phase6` isolation script (skips without `ANTHROPIC_API_KEY`)

## Phase 7 — Deterministic Pricing Engine ✅

### Goal

Pure function for price/timeline independent of LLM.

### Build

1. Pricing input/output types
2. Rule table based on team size, tool count, pain-point tags, industry
3. Unit tests for deterministic behavior and edge cases
4. Persist cost/timeline to `Proposal`

### Done

- [x] `backend/src/pricing/` — types, rules, engine, load-input, persist-pricing
- [x] Tiers: starter $999 / growth $1999 / enterprise $4999 with modifiers
- [x] Pipeline `price` step wired (stub input when `PIPELINE_USE_STUBS=true`)
- [x] `Proposal.costEstimateUSD` and `Proposal.timelineWeeks` persisted
- [x] Pricing breakdown logged to `RawSignal` (source: `pricing`)
- [x] 8 unit tests in `engine.test.ts`
- [x] `npm run test:phase7` isolation script (no API keys required)

## Phase 8 — Resend + Magic-Link Flow ✅

### Goal

Notify lead when report is ready and route them into authenticated dashboard view.

### Build

1. Resend "analysis ready" template
2. Better Auth magic-link login path
3. Tie lead email identity to dashboard access

### Done

- [x] Analysis-ready + magic-link email templates (`web/lib/email/templates.ts`)
- [x] Resend send helpers (analysis-ready via `callProvider`; auth magic-link direct)
- [x] Better Auth `magicLink` plugin + login UI magic-link form
- [x] Lead↔User linking on user/session create (`linkLeadsToUser`)
- [x] `POST /api/internal/analysis-ready` (Bearer `INTERNAL_API_SECRET`)
- [x] Worker notify after DONE (non-fatal; stubbed when `PIPELINE_USE_STUBS=true`)
- [x] Env: `INTERNAL_API_SECRET`, `WEB_APP_URL`, `RESEND_FROM_EMAIL`, `EMAIL_DRY_RUN`
- [x] `npm run test:phase8` (web) isolation script

## Phase 9 — Dashboard + PDF Download ✅

### Goal

Show `Analysis` + `Proposal` details and PDF link by ID.

### Build

1. Dashboard data fetch + status handling
2. Proposal content rendering
3. PDF URL and download CTA

### Also shipped

- Public `/analyze` page for guests (no login): submit domain/email → worker enqueue → live progress polling + “we’ll email you when complete” message

### Done

- [x] `/analyze` guest analysis flow with progress UI + email notify copy
- [x] Dashboard overview stats + recent analyses from DB
- [x] `/dashboard/analyses/[id]` proposal detail rendering
- [x] Blueprints + Proposals lists wired to real data
- [x] `GET /api/analysis/[id]/pdf` authenticated PDF download (pdf-lib)
- [x] Narrative persists `Proposal.narrativeText`; PDF step sets `Proposal.pdfUrl`
- [x] Magic-link callback → `/dashboard/analyses/{id}`

## Phase 10+ — Only After Full End-to-End Core Is Stable

- Admin monitoring dashboard (provider spend/failure/budgets)
- n8n post-analysis automation
- deeper competitor intelligence
- social signal integrations

## Dependency Flow

Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7 -> Phase 8 -> Phase 9 -> Phase 10+

## Execution Rule

For every phase:

1. Build
2. Test
3. Gate review
4. Only then continue

No skipping gates, no parallel phase jumping.
