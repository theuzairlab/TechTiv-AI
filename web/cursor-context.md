# TechTivAI

## Project Overview
TechTivAI is an AI-native interactive automation platform.
NOT a static agency website — it should feel like an AI operating system.
Solo developer project. Every decision should prioritize shipping speed without sacrificing quality.

## Tech Stack
- Framework: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS
- Animation: Framer Motion + GSAP + Three.js
- Fonts: Clash Display (headings), Cabinet Grotesk (body) via Fontsource
- API: Next.js Route Handlers (app/api) — no separate backend
- ORM: Prisma + Prisma Accelerate
- Database: PostgreSQL (local dev via pgAdmin, production on Neon)
- Auth: Auth (Google OAuth)
- AI: OpenAI GPT-4o (primary), Claude API (proposals/reasoning)
- Voice: Vapi (voice consultation UI)
- Agents: LangGraph (multi-step recommendation pipeline)
- Automation: n8n (self-hosted Hetzner VPS — heavy async jobs only)
- Storage: Cloudflare R2 (proposals, assets)

## Design System
Colors:
  --bg-primary: #04060d
  --bg-secondary: #080d1c
  --accent-cyan: #3de8ff
  --accent-lime: #c6ff00
  --accent-violet: #a78bfa
  --accent-rose: #ff5f7e
  --text-primary: #ffffff
  --text-muted: #8891a8

Typography:
  Display/headings: Clash Display
  Body: Cabinet Grotesk
  Accent: Instrument Serif

Motion principles:
  - Framer Motion: component-level animations, page transitions, stagger reveals, hover states
  - GSAP: scroll-based timelines, complex orchestrated sequences
  - Three.js: neural particle background (hero only, isolated component)
  - Never stack all three on the same element

## Project Structure
/app
  /page.tsx                  → Homepage (11 sections)
  /(pages)
    /discovery/page.tsx      → AI Discovery Platform
    /services/page.tsx       → Services
    /industries/[slug]/page.tsx → Industry pages
    /pricing/page.tsx        → Pricing Engine
    /case-studies/page.tsx   → Case Studies
    /contact/page.tsx        → Contact & Consultation
  /(dashboards)              → Admin Dashboard, and other if needs
  /api
    /ai/recommend/route.ts   → AI recommendation engine
    /ai/chat/route.ts        → AI chat (streaming)
    /pricing/calculate/route.ts → Dynamic pricing logic
    /proposals/generate/route.ts → Proposal generator (triggers n8n)
    /voice/session/route.ts  → Vapi session management
    /leads/route.ts          → Lead capture
    /auth/[...all]/route.ts  → Better Auth handler

/components
  /ui                        → Base components (Button, Card, Badge, Input)
  /sections                  → Homepage sections (Hero, Discovery, Services, etc.)
  /shared                    → Shared across pages (Navbar, Footer)
  /animations                → Reusable animation wrappers
  /three                     → Three.js components (NeuralBackground)

/lib
  /prisma.ts                 → Prisma client singleton
  /auth.ts                   → Better Auth config
  /ai.ts                     → OpenAI + Claude client setup
  /vapi.ts                   → Vapi client config
  /r2.ts                     → Cloudflare R2 client
  /posthog.ts                → PostHog client

/prisma
  /schema.prisma             → DB schema

## Homepage Sections (Blueprint Order)
1. Hero — split screen, NeuralBackground (Three.js), AI chat preview, animated metrics
2. Trust & Global Positioning — global map, client logos, compliance badges
3. AI Discovery Experience — multi-step form → recommendation → ROI output
4. Services Ecosystem — 9 services, connected node layout, Framer Motion
5. Workflow Visualizer — n8n-style interactive animated flow
6. Voice Consultant — Vapi integration, waveform UI
7. Pricing Engine — dynamic calculator, live price updates
8. Industry Solutions — 8 verticals
9. Case Studies — before/after metrics
10. Live Dashboard Demo — animated mockup
11. Final CTA

## API Route Rules
- All AI calls (OpenAI, Claude) go through /app/api — never call from client components
- Stream AI responses using ReadableStream + Vercel AI SDK
- Heavy async jobs (PDF generation, LangGraph pipelines) POST to n8n webhook, return job_id, client polls status
- All route handlers are TypeScript with Zod input validation
- Rate limit AI endpoints using Upstash Redis (add when needed, not from day one)

## Dev Rules (Always Follow)
1. TypeScript strict mode everywhere — no `any`
2. Tailwind only for styling — no inline styles, no CSS modules (exception: Three.js canvas positioning)
3. Framer Motion for component animations, GSAP for scroll timelines — don't mix them on the same element
4. Three.js components always lazy loaded with next/dynamic and ssr: false
5. Prisma client imported only from /lib/prisma.ts — never instantiate directly in route handlers
6. All colors from the design token system above — no hardcoded hex values outside globals.css
7. Every lead interaction and AI session gets logged to DB
8. Mobile-first — design from 375px up
9. n8n handles anything that could exceed Vercel's function timeout (60s hobby / 300s pro)
10. Environment variables follow this pattern: NEXT_PUBLIC_ for client, no prefix for server-only

## Environment Variables Structure
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
DATABASE_URL=                    # Neon connection string
DIRECT_URL=                      # Neon direct URL (Prisma migrations)
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
VAPI_PRIVATE_KEY=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
N8N_WEBHOOK_SECRET=
PRISMA_ACCELERATE_URL=           # Replaces DATABASE_URL in production