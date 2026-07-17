# TechTivAI

**Deploy AI Employees Across Your Business**

TechTivAI is an AI-native interactive automation platform — not a static agency site. It combines intelligent automation, AI agents, voice assistants, and business workflows into a cinematic, conversion-focused web experience.

**Live site (planned):** [techtivai.com](https://techtivai.com)

---

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 0** | ✅ Complete | Design system, base UI, layout, navigation |
| **Phase 1** | ✅ Complete | All 11 homepage sections (interactive UI, mock AI) |
| **Phase 2** | 🔜 Next | Prisma, leads API, PostHog |
| **Phase 3+** | Planned | Real AI APIs, voice (Vapi), auth, proposals |

---

## Homepage Sections

The homepage follows the blueprint order in `lib/homepage-sections.ts`:

1. **Cinematic Hero** — Three.js neural background, AI chat preview, animated metrics
2. **Trust & Global Positioning** — Aceternity world map, client logos, compliance badges
3. **AI Discovery Experience** — Multi-step wizard with ROI recommendations
4. **AI Service Ecosystem** — 9-service hub-and-spoke graph with live detail panel
5. **Live AI Workflow Visualizer** — n8n-style draggable workflow canvas
6. **AI Voice Consultant** — Simulated voice consultation UI
7. **AI Pricing Engine** — Dynamic sliders and tiered pricing
8. **Industry Solutions** — 8 vertical cards with detail panels
9. **Case Studies** — Before/after metrics and testimonials
10. **Live Dashboard Demo** — Animated command-center mockup
11. **Final CTA** — Discovery, consultation, and contact paths

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage (all 11 sections) |
| `/discovery` | AI Discovery Platform |
| `/services` | Services overview |
| `/pricing` | Pricing engine |
| `/case-studies` | Case studies |
| `/contact` | Contact & consultation |
| `/industries/[slug]` | Industry solution pages (8 verticals) |
| `/dashboard` | Admin dashboard (Phase 4) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, design tokens in `app/globals.css` |
| UI | Custom components + shadcn / Aceternity UI (world map) |
| Animation | Framer Motion, Three.js (`@react-three/fiber`) |
| Fonts | Clash Display, Cabinet Grotesk, Instrument Serif |

**Planned (later phases):** Prisma + Neon, Better Auth, OpenAI / Claude, Vapi, n8n, Cloudflare R2, PostHog

---

## Project Structure

```
app/
  page.tsx                 # Homepage
  (pages)/                 # Discovery, services, pricing, etc.
  (dashboards)/            # Admin dashboard
  globals.css              # Design tokens & theme
components/
  ui/                      # Button, Card, Badge, GlassPanel, WorldMap
  sections/                # Homepage section components
  shared/                  # Navbar, Footer, mobile menu
  animations/              # SectionWrapper, stagger helpers
  three/                   # Neural background (lazy-loaded)
lib/
  site.ts                  # Site config & nav links
  homepage-sections.ts     # Canonical section order
  hero.ts, discovery.ts, services.ts, …  # Section data
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

---

## Design System

Dark theme only. Tokens live in `app/globals.css`:

- **Backgrounds:** `#04060d`, `#080d1c`
- **Accents:** cyan `#3de8ff`, lime `#c6ff00`, violet `#a78bfa`, rose `#ff5f7e`
- **Typography:** Clash Display (headings), Cabinet Grotesk (body), Instrument Serif (accent)

Use Tailwind utilities mapped to these tokens — avoid hardcoded hex in components.

---

## Development Notes

- **Source of truth for section order:** `TechTivAI website blueprint.txt` / `lib/homepage-sections.ts`
- **Agent & AI rules:** see `cursor-context.md` and `AGENTS.md`
- **Build phases & daily tasks:** see `NOTES.txt`
- Three.js components are lazy-loaded with `ssr: false`
- AI API routes will live under `app/api/` (Phase 2–4) — never call LLMs from client components

---

## License

Private project. All rights reserved.
