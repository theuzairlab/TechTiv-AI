
export const siteConfig = {
  name: "TechTivAI",
  tagline: "Deploy AI Employees Across Your Business",
  description:
    "TechTivAI builds intelligent automation systems, AI agents, voice assistants, and business workflows that reduce operational costs and accelerate growth.",
  url: "https://techtivai.com",
} as const;

export const navLinks = [
  { label: "Analyze", href: "/analyze" },
  { label: "Discovery", href: "/discovery" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries"},
  { label: "Pricing", href: "/pricing" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact", href: "/contact" },
] as const;

export const homepageSections = [
  { id: "hero", label: "Cinematic Hero", number: 1 },
  { id: "trust", label: "Trust & Global Positioning", number: 2 },
  { id: "discovery", label: "AI Discovery Experience", number: 3 },
  { id: "services", label: "AI Service Ecosystem", number: 4 },
  { id: "workflow", label: "Workflow Visualizer", number: 5 },
  { id: "voice", label: "AI Voice Consultant", number: 6 },
  { id: "pricing", label: "AI Pricing Engine", number: 7 },
  { id: "industries", label: "Industry Solutions", number: 8 },
  { id: "case-studies", label: "Case Studies", number: 9 },
  { id: "dashboard", label: "Live Dashboard Demo", number: 10 },
  { id: "cta", label: "Final CTA", number: 11 },
] as const;
