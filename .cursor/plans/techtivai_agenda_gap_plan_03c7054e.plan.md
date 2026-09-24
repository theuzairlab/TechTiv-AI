---
name: TechTivAI Agenda Gap Plan
overview: "Complete phased delivery plan covering every item in the client's Final Developer Agenda (items 1–19). Phase 1 (report/PDF + service conversion CTA) is done. Remaining work: paywall, landing page, client dashboard expansion, voice AI, subscriptions, full admin CMS, mobile app, end-to-end funnel polish, and developer SaaS recommendations."
todos:
  - id: p1-done
    content: Phase 1 DONE — Report/PDF 13 sections + recommended services CTA form
    status: completed
  - id: p2-paywall
    content: Phase 2 — $5 Stripe blueprint paywall + PDF unlock after payment
    status: pending
  - id: p3-landing
    content: "Phase 3 — Homepage redesign as AI Business Consultant platform (agenda #9)"
    status: completed
  - id: p4-client-dashboard
    content: Phase 4 — Expand client dashboard (AI score, history, payments, consultant entry)
    status: pending
  - id: p5-voice
    content: Phase 5 — AI Consultant real-time voice (Gemini Live first; Vapi/ElevenLabs for phone later)
    status: in_progress
  - id: p6-subscriptions
    content: Phase 6 — Monthly subscription plans on top of $5 blueprint
    status: pending
  - id: p7-admin-cms
    content: Phase 7 — Full Admin CMS (clients, calls, payments, KPIs, implementation status)
    status: completed
  - id: p8-mobile
    content: Phase 8 — React Native/Expo mobile MVP sharing same backend
    status: pending
  - id: p9-funnel
    content: Phase 9 — End-to-end automated flow polish + sales/delivery handoff
    status: completed
  - id: p10-recommendations
    content: Phase 10 — Developer SaaS recommendations (memory, security, analytics, scale)
    status: pending
isProject: false
---

# TechTivAI Agenda Gap Plan (Full)

This plan maps **every item** in [TechTivAI - Final Developer Agenda (1).pdf](TechTivAI%20-%20Final%20Developer%20Agenda%20(1).pdf) to a delivery phase. Nothing from the PDF is left as "out of scope / later maybe" — each requirement has a phase.

## Agenda → phase map

| PDF # | Agenda item | Phase | Status |
|------|-------------|-------|--------|
| 1–8 | Service catalog (Agents, LLM, Automation, Voice, Web, Mobile, AI/ML, Tech Stack) | Phase 1 (recos) + Phase 3 (marketing) + ongoing in reports | Partial (in report services) |
| 9 | Homepage Product Experience | Phase 3 | **Done** |
| 10 | AI Business Assessment & Blueprint | Phase 1 (engine) + Phase 2 (paid unlock) | Mostly done; paywall pending |
| 11 | AI Consultant — Chat & Voice | Phase 5 | In-dashboard Gemini chat + Live voice (Vapi phone later) |
| 12 | $5 AI Blueprint & PDF Report | Phase 1 (content) + Phase 2 (payment) | Content done; payment pending |
| 13 | CMS / Admin Dashboard | Phase 7 | Partial admin exists |
| 14 | Client Dashboard | Phase 4 | Partial dashboard exists |
| 15 | Service Conversion System | Phase 1 | Done (report + CTA form → admin leads) |
| 16 | Subscription Model | Phase 6 | Pending |
| 17 | Mobile App MVP | Phase 8 | Pending |
| 18 | Full Automated Flow | Phase 9 | Pending (glue + polish) |
| 19 | Developer Recommendations | Phase 10 | Pending (document + optional spikes) |

## Current state (verified)

- **Working:** analysis pipeline (crawl → discover → social → audit → competitors → synthesize → pricing → narrative → pdf), grounded text consultation, ReportV2 with categorized opportunities + `currentTechStack` + `socialGrowth` + `recommendedServices`, PDF with 13 agenda sections, dashboard report UI, "Build This With TechTivAI" popup → `/api/leads` (`service_request`), partial admin (`/admin`: leads, analyses, providers, sessions, proposals, analytics), Better Auth (user/admin roles).
- **Missing:** Stripe $5 paywall, homepage repositioning per agenda #9, client dashboard extras (AI score, voice/call history, subscription/payment history), real voice AI, subscriptions, full admin CMS (clients/companies/calls/recordings/transcripts/payments/subscriptions/KPIs), mobile app, end-to-end funnel glue.

---

## Phase 1 — Report, PDF & Service Conversion — DONE

**Covers PDF:** #10 (assessment content), #12 (PDF sections), #15 (service conversion), parts of #1–8 (as recommended service categories).

**Delivered:**
- All 13 PDF sections in synthesis + dashboard + PDF builder.
- Deterministic `currentTechStack` from audit evidence.
- Categorized opportunities: AI / Automation / AI Agent / Chatbot-Voice / Web-App.
- `recommendedServices` with Problem → Service → Stack → Scope → Timeline → CTA.
- Service request popup → admin leads (`source: service_request`).

**Optional polish (if needed later):** deepen CRM Automation / Marketing & Social as first-class opportunity types if client wants them as separate PDF headings beyond current socialGrowth + automation types.

---

## Phase 2 — $5 AI Blueprint Paywall (Stripe)

**Covers PDF:** #12 (preview → pay $5 → full blueprint + PDF download).

**Goal:** Limited free preview → pay $5 → unlock full report + PDF.

1. Prisma: `Payment` model (`analysisId`, `leadId`/`userId`, `amountUSD`, `currency`, `stripePaymentIntentId`/`checkoutSessionId`, `status`, `createdAt`).
2. Stripe Checkout or Payment Element: `web/app/api/payments/create-intent/route.ts` + webhook `.../webhook/route.ts`.
3. Gate full `analysis-detail-view` + `/api/analysis/[id]/pdf` behind `Payment.status === "paid"` (admin/dev bypass allowed).
4. Teaser UI: "$5 for the full AI Blueprint" CTA after assessment.
5. Keep $5 as one-time entry product (subscriptions come in Phase 6).

**Key files:** [web/prisma/schema.prisma](web/prisma/schema.prisma), [web/components/analysis/analysis-teaser-results.tsx](web/components/analysis/analysis-teaser-results.tsx), [web/app/api/analysis/[id]/pdf/route.ts](web/app/api/analysis/[id]/pdf/route.ts).

---

## Phase 3 — Homepage Product Experience — DONE

**Covers PDF:** #9, marketing surface for #1–8 and #8 (AI Technology Stack).

**Delivered:**
- Hero copy + CTAs: “Discover What AI Can Do For Your Business”, “Get My AI Blueprint — $5”, “Talk to AI Consultant” → `/analyze`
- Interactive stack after hero: Models → Agents → Automation → CRM → Voice → Development → Data & Cloud
- Section order: Assessment → Consultant → Agentic → Automation → Web & App → How It Works → Blueprint Preview → Pricing ($5 entry + implementation + advisory) → FAQ → Final CTA
- Canonical order updated in [web/lib/homepage-sections.ts](web/lib/homepage-sections.ts)

**Note:** $5 paywall itself is still Phase 2 — CTAs currently open `/analyze` (preview free until Stripe ships).

---

## Phase 4 — Client Dashboard Expansion ✅ DONE

**Covers PDF:** #14 (and parts of #10/#15 visible in-portal).

**Goal:** After signup, each client has a full portal — not only one analysis report page.

**Delivered:**
- Overview Business AI Score widget (avg scorecard) + opportunity / automation / service counts
- Recent analyses show score, top problem, opportunity count
- Analysis detail: portal actions (AI Consultant entry, Voice placeholder, PDF unlock UI), conversation history from `ConsultationMessage`
- `/dashboard/proposals` lists real `service_request` leads + generated proposal blueprints
- `/dashboard/consultant` portal entry with blueprint context selection + voice placeholder
- Sidebar nav includes AI Consultant
- `pdfUnlocked` flag on analysis detail/list (defaults unlocked for DONE; Phase 2 Stripe will gate)

**Deferred to later phases:** live in-dashboard continuing chat + Gemini Live voice (Phase 5), Stripe PDF entitlement enforcement (Phase 2), subscription/payment history (Phase 6 / Phase 2+).

---

## Phase 5 — AI Consultant: Chat + Real-Time Voice

**Covers PDF:** #11, #4 (Conversational & Voice AI as product capability).

**Goal:** After signup, client talks to TechTivAI consultant via **text + real-time voice**, grounded in business profile, assessment answers, tools, problems, and generated blueprint.

### Already done
- Text chat consultation (pre-analysis + grounded site brief).

### To build
1. **In-dashboard AI Consultant chat** that continues after blueprint (not only intake): load analysis + report + consultation history as context.
2. **Real-time voice (web first):**
   - **Primary:** Gemini Live API (low-latency in-browser voice; cost-effective; fits consultant-in-dashboard).
   - **Later / phone agents:** Vapi + Twilio for PSTN "AI Voice Receptionist / Phone Agents"; ElevenLabs for voice quality/TTS when needed.
3. Persist: `VoiceSession` / call metadata, optional recordings/transcripts (needed for Phase 7 admin).
4. Personalization: consultant must use business profile, assessment, tools, requirements, problems, blueprint.

### Voice vendor decision (locked for this plan)

| Option | Use when |
|--------|----------|
| Gemini Live API | In-app web voice consultant (Phase 5 start) |
| Vapi + Twilio | Phone numbers / AI receptionist / outbound-inbound calls |
| ElevenLabs | Premium voice/TTS under Vapi or Gemini when quality is the priority |

---

## Phase 6 — Subscription Model

**Covers PDF:** #16.

**Goal:** Monthly plans for continued access, on top of the $5 one-time blueprint.

Plans should include (as product features):
- AI Consultant access (chat + voice entitlements)
- Ongoing / re-run business analysis
- New AI recommendations
- Automation opportunities updates
- Blueprint updates
- AI advisory
- Voice consultation minutes/limits

**Build:**
1. Prisma: `SubscriptionPlan`, `Subscription` (user/company, Stripe subscription id, status, period).
2. Stripe Billing: checkout for plans, customer portal, webhooks.
3. Entitlement checks across consultant, re-analysis, voice, PDF refresh.
4. Client dashboard + admin visibility of active subscriptions.
5. Keep **$5 one-time Blueprint** as the entry product (Phase 2).

---

## Phase 7 — Full CMS / Admin Dashboard — ✅ DONE (except payments/subscriptions)

**Covers PDF:** #13.

**Goal:** Complete TechTivAI Admin CMS for all customer and product data.

### Manage (view/edit as appropriate)
- Clients / Users — done (`/admin/clients`)
- Companies — done (`/admin/companies`)
- Assessments — done (`/admin/analyses`)
- AI Consultant Conversations — done (`/admin/consultant-sessions`, new)
- Voice Calls — done (`/admin/voice`)
- Voice Recordings — deferred (on-device only; no storage infra requested yet)
- Transcripts — done (voice transcripts linked from `/admin/voice` → `/admin/consultant-sessions`)
- AI Analysis — done
- Generated Blueprints — done (`/admin/blueprints`)
- PDF Reports — done (via analysis detail)
- Recommended Services — done (view, in report)
- Recommended Technology Stack — done (view, in report)
- Payments — **deferred (Phase 2 Stripe)**
- Subscriptions — **deferred (Phase 6 Stripe Billing)**
- Leads — done, with assignee picker
- Consultation Requests (service_request leads) — done (`/admin/implementation`)
- Implementation Status — done, with assignee picker

### Admin KPIs
- Total Users — done
- New Assessments — done (Overview tile)
- Paid Blueprints — **deferred (Stripe)**
- Blueprint Revenue — **deferred (Stripe)**
- Active Subscriptions — **deferred (Stripe)**
- AI Chat Sessions — done (Overview tile + Analytics)
- Voice Calls — done
- Leads Generated — done
- Consultation Requests — done
- Service Opportunities — done (Overview tile + Analytics)
- Converted Clients — done

**Delivered this pass:** `/admin/consultant-sessions` (post-blueprint chat + voice transcripts, Text/Voice badges, deep link from Voice page), `LeadAssigneeSelect` wired into Leads + Implementation, three new KPIs (AI Chat Sessions, New Assessments, Service Opportunities) on Overview + Analytics.

**Remaining (non-payment, optional polish):** editable client/company fields, voice recording storage + player, CMS editing of recommended services/stack (currently view-only).

---

## Phase 8 — Mobile App MVP (React Native / Expo)

**Covers PDF:** #17, #6 (mobile as product offering + client app).

**Goal:** Expo/React Native MVP using the **same backend, AI engine, CMS, and client data** as web.

App features:
- Login / Signup
- Business Profile
- AI Assessment
- AI Business Score
- AI Recommendations
- Blueprint
- PDF
- AI Chat Consultant
- Voice AI Consultant
- Recommended Services
- Subscription
- Notifications

**Build approach:** new `mobile/` app; shared API contracts; auth via Better Auth-compatible mobile flow; push notifications (Expo).

---

## Phase 9 — Full Automated Flow & Sales Handoff

**Covers PDF:** #18 (and glue across #10–16).

**Target funnel (end-to-end):**

```text
Website / Mobile
  → Signup/Login
  → AI Assessment
  → AI Chat/Voice Consultant
  → Business Analysis (AI + Agentic + Automation + Web/App)
  → Technology Stack Recommendation
  → Service Recommendation
  → Blueprint Preview
  → $5 Payment
  → Complete Blueprint + PDF
  → Client Dashboard
  → AI Consultant
  → Book Consultation / Request Implementation
  → TechTivAI Sales & Delivery
```

**Status: ✅ DONE (except the $5 payment step, kept as-is on purpose, and mobile).**

**Work in this phase:**
1. ~~Ensure every step above exists and links cleanly (no dead CTAs).~~ Done — contact page voice demo relabeled ("Voice AI (demo)") with a clear CTA to the real Gemini Live consultant in `/dashboard/consultant`; FAQ updated to match. `Button` component bug fixed (`onClick` was silently dropped whenever `href` was also set).
2. ~~"Book consultation / Request implementation" workflow~~ Done — service-request success state now offers "Book a call now" → `/contact#schedule`; assignee picker (Phase 7) covers CRM handoff; proposal/implementation status already tracked.
3. Email notifications — **preview/blueprint ready**: done (existing). **Service request received**: done this pass — `notifyServiceRequestReceived` sends an admin alert (`ADMIN_NOTIFICATION_EMAIL`, comma-separated) with client, service, problem, scope, timeline, and a direct admin link; best-effort, never blocks lead creation. **Payment received / blueprint unlocked**: deferred with Phase 2 Stripe.
4. QA the full path on web — done for the non-payment path (Website → Signup → Assess → Chat → Analysis → Stack/Services → Preview → Dashboard → Consultant chat/voice → Service request → admin alert + Implementation + Inbox). Mobile QA waits on Phase 8.

**Explicitly left unchanged (client instruction):** the "Get My AI Blueprint — $5" CTA still opens free `/analyze` with $5 copy — do not change until Stripe (Phase 2) ships.

**Deferred with payments:** $5 payment step in the funnel diagram, payment-received / blueprint-unlocked emails.

---

## Phase 10 — Developer Recommendations (Agenda #19)

**Covers PDF:** #19 — recommendations to strengthen TechTivAI as a commercial SaaS.

Document and (where agreed) implement spikes for:

| Area | Recommendations |
|------|-----------------|
| Additional AI services | Multi-agent ops (LangGraph/CrewAI), RAG knowledge bases per client, WhatsApp/GHL bots, document intelligence |
| Integrations | HubSpot/Salesforce CRM sync, Slack/email alerts, calendar booking, Stripe Customer Portal |
| Security | Role hardening, audit logs, PII retention policy, secrets rotation, rate limits, webhook signatures |
| Database architecture | Company/org multi-tenant model, soft deletes, archive old analyses, separate Payment/Subscription/Voice tables |
| AI memory | Persistent client memory store (profile + past blueprints + chat) for consultant continuity |
| Analytics | Funnel metrics (assessment → pay → service request → won), provider cost dashboards |
| Automation | Internal n8n/Make for sales ops when a service CTA fires |
| Scalability | Queue isolation, provider budget guards (already partial), CDN for PDFs, caching |
| Subscription features | Tiered minutes for voice, re-analysis quotas, team seats |
| Mobile | Offline blueprint view, push for "report ready" / "consultant reply" |

**Deliverable:** written recommendation addendum (can update client summary) + prioritized backlog items pulled into Phases 4–9 as needed.

---

## Service catalog alignment (PDF #1–8)

These are not separate product builds in isolation — they are **what TechTivAI sells and recommends**:

1. **AI Agentic Solutions** — agents, multi-agent, sales/support/ops agents  
2. **AI & LLM Solutions** — assistants, RAG, chatbots, copilots, document intelligence  
3. **AI Automation** — n8n/Make/Zapier/GHL, CRM/sales/marketing/email automation  
4. **Conversational & Voice AI** — Vapi/ElevenLabs/Twilio phone & voice agents  
5. **AI-Powered Web Development** — sites, SaaS, dashboards, portals  
6. **AI-Powered Mobile App Development** — iOS/Android AI apps  
7. **AI/ML & Data** — ML, predictive analytics, CV, NLP  
8. **AI Technology Stack** — models, agents, automation, CRM, voice, cloud (homepage + recommended stack)

**Where they land:** Phase 1 report services (done), Phase 3 homepage/services messaging, Phase 5–8 product features that deliver those capabilities inside the platform.

---

## Sequencing (build order)

1. **Phase 1** — Report / PDF / Service conversion — **DONE**  
2. **Phase 2** — $5 Stripe paywall  
3. **Phase 3** — Homepage redesign  
4. **Phase 4** — Client dashboard expansion  
5. **Phase 5** — Voice AI consultant (Gemini Live → later Vapi phone)  
6. **Phase 6** — Subscriptions  
7. **Phase 7** — Full admin CMS + KPIs  
8. **Phase 8** — Mobile MVP  
9. **Phase 9** — Full funnel polish + sales handoff  
10. **Phase 10** — Developer SaaS recommendations doc + backlog  

**Rationale:** monetize blueprint (2) and marketing site (3) next; deepen portal (4); add voice (5); recurring revenue (6); ops/CMS (7); then mobile (8); finally glue the full automated flow (9) and formalize long-term SaaS recommendations (10).

---

## Core objective (from PDF)

TechTivAI is not a normal AI website. It is a complete AI-powered product ecosystem that can analyze any business, identify technology and automation needs, recommend TechTivAI services, generate a paid professional blueprint, and convert that opportunity into a high-ticket implementation client.
