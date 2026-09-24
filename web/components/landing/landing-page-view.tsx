"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { LandingPricingCards } from "@/components/landing/landing-pricing-cards";
import { LandingWorkflowSection } from "@/components/landing/landing-workflow-section";
import {
  landingAgentForceCards,
  landingAgents,
  landingAssessmentSteps,
  landingAutomationItems,
  landingBlueprintPreviewSections,
  landingConsultantPoints,
  landingFaqItems,
  landingHowItWorks,
  landingServices,
  landingStack,
  landingStackTabs,
  landingWebAppItems,
  tickerItems,
  type LandingStackTabId,
} from "@/lib/landing-page-data";
import { cn } from "@/lib/utils";

const sectionClass = "relative z-[1] px-[5%] py-[110px] max-md:px-[4%] max-md:py-20";

function serviceCardClass(span?: 1 | 2 | 3) {
  return cn(
    "scroll-reveal group relative overflow-hidden bg-surface-card p-[44px_38px_40px] transition-colors duration-[350ms] hover:bg-[var(--card-hover-bg)]",
    "after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,var(--svc-c1),var(--svc-c2))] after:transition-transform after:duration-[450ms] after:ease-out after:content-[''] group-hover:after:scale-x-100",
    span === 2 && "col-span-2 max-lg:col-span-1",
    span === 3 && "col-span-3 max-lg:col-span-2 max-md:col-span-1",
  );
}

export function LandingPageView() {
  const [activeStackTab, setActiveStackTab] = useState<LandingStackTabId>("all");
  const filteredStack = useMemo(
    () =>
      activeStackTab === "all"
        ? landingStack
        : landingStack.filter((item) => item.tab === activeStackTab),
    [activeStackTab],
  );

  return (
    <>
      {/* 1. Hero — agenda #9 */}
      <section className="relative z-[1] grid min-h-[calc(100vh-68px)] place-items-center overflow-hidden px-[5%] pt-12 pb-20 max-md:px-[4%] max-md:pt-10 max-md:pb-[60px]">
        <div className="pointer-events-none absolute -top-[200px] -left-[200px] size-[700px] rounded-full bg-accent-cyan/[0.12] blur-[120px]" />
        <div className="pointer-events-none absolute -right-[100px] -bottom-[100px] size-[500px] rounded-full bg-[var(--hero-glow-accent)] blur-[120px]" />
        <div className="pointer-events-none absolute top-[30%] left-[55%] size-[300px] rounded-full bg-accent-cyan/[0.07] blur-[120px]" />

        <div className="relative max-w-[920px] text-center">
          <div className="hero-eyebrow mb-8 animate-fade-up">
            <AnimatedIcon icon={Zap} size={14} className="text-brand" />
            TechTivAI — AI Business Consultant & Transformation Platform
          </div>

          <h1 className="mb-7 animate-fade-up font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.02] font-bold tracking-[-2px] text-text-primary [animation-delay:0.08s]">
            Discover What{" "}
            <br />
            <span className="text-gradient-hero">AI Can Don For </span>
            <br />
            Your Business
          </h1>

          <p className="mx-auto mb-12 max-w-[560px] animate-fade-up text-[1.1rem] leading-[1.75] text-text-muted [animation-delay:0.16s]">
            AI analyzes your business, identifies opportunities, and recommends
            the right AI, automation, web, app, and digital solutions.
          </p>

          <div className="flex animate-fade-up flex-wrap items-center justify-center gap-3.5 [animation-delay:0.24s]">
            <a
              href="/analyze"
              className="btn-lime flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              <AnimatedIcon icon={Rocket} size={18} className="text-on-accent" />
              Get My AI Blueprint — $5
            </a>
            <a
              href="/analyze"
              className="btn-ghost rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              <MessageSquare size={16} strokeWidth={2} />
              Talk to AI Consultant
            </a>
          </div>
        </div>
      </section>

      <div className="relative z-[1] overflow-hidden border-y border-border-subtle bg-bg-secondary py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-ticker gap-12">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span key={`${item}-${index}`} className="ticker-item gap-2.5">
              {item}{" "}
              <Sparkles size={12} className="ticker-sep" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      {/* 2. Technology stack — grid + category tabs (All + filters) */}
      <section id="stack" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[50px]">
          <div className="s-label">— Technology</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            The Most Advanced
            <br />
            AI Stack Available
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Browse the full stack, or filter by category — models, agents,
            automation, data, voice, and development.
          </p>
        </div>

        <div className="scroll-reveal mb-8 flex flex-wrap gap-2.5">
          {landingStackTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStackTab(tab.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition-colors",
                activeStackTab === tab.id
                  ? "border-accent-lime/50 bg-accent-lime/10 text-brand"
                  : "border-border-subtle bg-surface-card text-text-muted hover:border-border-highlight hover:text-text-primary",
              )}
              data-cursor-target
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-5 gap-3 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
          {filteredStack.map((item) => (
            <div
              key={`${item.name}-${item.category}`}
              className="cursor-default rounded-surface-md border border-border-subtle bg-surface-card px-4 py-[18px] text-center transition-all duration-200 hover:scale-[1.03] hover:border-border-highlight hover:bg-surface-elevated"
              data-cursor-target
            >
              <AnimatedIcon
                icon={item.icon}
                size={24}
                className="mx-auto mb-2 text-brand-cyan"
              />
              <div className="text-[0.78rem] font-semibold text-text-body">
                {item.name}
              </div>
              <div className="mt-[3px] text-[0.65rem] text-text-muted">
                {item.category}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Automation — keep below technology stack */}
      <LandingWorkflowSection />

      {/* 3. AI Business Assessment */}
      <section id="assessment" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[60px] ">
          <div className="s-label">— AI Business Assessment</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            We research your business
            <br />
            before we recommend anything
          </h2>
          <p className="text-base leading-[1.75] text-text-muted">
            From industry and operations to tools, marketing, and social — then
            we surface automation and AI opportunities that actually fit.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {landingAssessmentSteps.map((step, index) => (
            <div
              key={step.title}
              className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-8"
            >
              <div className="mb-3 text-[0.7rem] font-bold tracking-[2px] text-brand-cyan">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mb-2 font-display text-[1.2rem] font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-[0.9rem] leading-[1.7] text-text-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="scroll-reveal mt-10">
          <a
            href="/analyze"
            className="btn-lime inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
            data-cursor-target
          >
            Start my assessment
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* 4. AI Consultant */}
      <section id="consultant" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[60px] ">
          <div className="s-label">— AI Consultant</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Chat with an AI consultant
            <br />
            that knows your business
          </h2> 
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="scroll-reveal">
            <p className="mb-8 max-w-[480px] text-base leading-[1.75] text-text-muted">
              After you share your footprint, the consultant uses your profile,
              assessment answers, tools, and problems to give personalized
              recommendations — not generic scripts.
            </p>
            <ul className="mb-8 space-y-3">
              {landingConsultantPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-[0.9rem] text-text-muted before:mt-1 before:text-brand before:content-['→']"
                >
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="/analyze"
              className="btn-ghost inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              <MessageSquare size={16} />
              Talk to AI Consultant
            </a>
          </div>

          <div className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent-cyan/15 text-brand-cyan">
                <Bot size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  TechTivAI Consultant
                </div>
                <div className="text-xs text-text-muted">Online · grounded research</div>
              </div>
            </div>
            <div className="space-y-3 text-[0.88rem] leading-[1.65]">
              <div className="rounded-2xl rounded-tl-sm bg-surface-elevated px-4 py-3 text-text-muted">
                I reviewed your site and social profiles. Your booking flow looks
                manual — what&apos;s the biggest delay when a lead comes in?
              </div>
              <div className="ml-8 rounded-2xl rounded-tr-sm border border-accent-lime/25 bg-accent-lime/5 px-4 py-3 text-text-primary">
                We still qualify leads by hand in WhatsApp and the CRM.
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-surface-elevated px-4 py-3 text-text-muted">
                Got it. I&apos;ll prioritize lead automation and an AI
                qualification agent in your blueprint.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI / Agentic Solutions */}
      <section id="agents" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">— AI / Agentic Solutions</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Autonomous agents for
            <br />
            sales, support, and ops
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Multi-agent systems that plan, use tools, and execute — sales agents,
            support agents, and operations agents that work around the clock.
          </p>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-md:grid-cols-1">
          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-12 max-md:p-10">
            <div className="s-label">— Featured</div>
            <h3 className="mb-3.5 font-display text-[1.8rem] leading-tight font-bold tracking-[-0.8px] text-text-primary">
              AgentForce
              <br />
              <span className="text-brand-cyan">Enterprise Suite</span>
            </h3>
            <p className="mb-8 text-[0.9rem] leading-[1.7] text-text-muted">
              Deploy specialized AI agents that collaborate on research,
              outreach, analysis, and execution — built on LangGraph and CrewAI.
            </p>
            <div className="mb-8 grid grid-cols-2 gap-3.5">
              {landingAgentForceCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-surface-md border border-border-subtle bg-surface-elevated p-[18px]"
                >
                  <AnimatedIcon
                    icon={card.icon}
                    size={22}
                    className="mb-2 text-brand-cyan"
                  />
                  <div className="mb-1 text-[0.82rem] font-bold text-text-primary">
                    {card.title}
                  </div>
                  <div className="text-xs text-text-muted">{card.desc}</div>
                </div>
              ))}
            </div>
            <a
              href="/analyze"
              className="btn-lime inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              See if agents fit your business →
            </a>
          </div>

          <div className="scroll-reveal flex flex-col gap-4">
            {landingAgents.map((agent) => (
              <div
                key={agent.name}
                className="flex cursor-default items-center gap-4 rounded-surface-md border border-border-subtle bg-surface-elevated px-6 py-5 transition-[border-color,transform] duration-300 hover:translate-x-1 hover:border-border-highlight"
                data-cursor-target
              >
                <div
                  className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] text-brand-cyan"
                  style={{ background: agent.bg }}
                >
                  <AnimatedIcon icon={agent.icon} size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-[0.88rem] font-bold text-text-primary">
                    {agent.name}
                  </div>
                  <div className="mt-0.5 text-[0.78rem] text-text-muted">
                    {agent.role}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded px-[9px] py-[3px] text-[0.68rem] font-semibold tracking-[1px]",
                    agent.status === "LIVE" ? "status-live" : "status-beta",
                  )}
                >
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AI Automation */}
      <section id="automation" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[60px]">
          <div className="s-label">— AI Automation</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Workflows that run
            <br />
            without the busywork
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Business process automation with n8n, Make, Zapier, and GHL — CRM,
            sales, marketing, appointments, and email.
          </p>
        </div>

        <div className="mb-14 grid gap-4 md:grid-cols-3">
          {landingAutomationItems.map((item) => (
            <div
              key={item.title}
              className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-8"
            >
              <h3 className="mb-2 font-display text-[1.15rem] font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="mb-5 text-[0.88rem] leading-[1.7] text-text-muted">
                {item.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.pills.map((pill) => (
                  <span key={pill} className="pill">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. AI-Powered Web & App Development */}
      <section id="web-app" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[60px]">
          <div className="s-label">— AI-Powered Web & App Development</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Products with AI
            <br />
            built into the experience
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Websites, SaaS platforms, dashboards, portals, and mobile apps —
            with AI search, assistants, and automation inside.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {landingWebAppItems.map((item) => (
            <div
              key={item.title}
              className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-8"
            >
              <h3 className="mb-2 font-display text-[1.15rem] font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="text-[0.9rem] leading-[1.7] text-text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 overflow-hidden max-lg:grid-cols-2 max-md:grid-cols-1">
          {landingServices.slice(0, 3).map((service) => (
            <div
              key={service.num}
              className={`${serviceCardClass(service.span)} rounded-surface-xl border border-border-subtle hover:border-border-highlight`}
              style={
                {
                  "--svc-c1": service.c1,
                  "--svc-c2": service.c2,
                } as React.CSSProperties
              }
            >
              <div className="svc-num mb-[22px]">{service.num}</div>
              <div className="svc-icon-wrap mb-[22px] flex size-[54px] items-center justify-center rounded-surface-sm text-brand-cyan">
                <AnimatedIcon
                  icon={service.icon}
                  size={26}
                  className="text-brand-cyan"
                />
              </div>
              <div className="mb-2.5 font-display text-[1.15rem] font-semibold tracking-[-0.3px] text-text-primary">
                {service.title}
              </div>
              <div className="mb-6 text-[0.875rem] leading-[1.7] text-text-muted">
                {service.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. How It Works */}
      <section id="how-it-works" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">— How It Works</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            From first link to
            <br />
            full AI Blueprint
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {landingHowItWorks.map((step) => (
            <div
              key={step.num}
              className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-7"
            >
              <div className="mb-4 font-display text-[1.6rem] font-bold text-brand-cyan">
                {step.num}
              </div>
              <h3 className="mb-2 text-[1.05rem] font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-[0.88rem] leading-[1.65] text-text-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Blueprint Preview */}
      <section id="blueprint" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="scroll-reveal">
            <div className="s-label">— Blueprint Preview</div>
            <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
              What&apos;s inside your
              <br />
              $5 AI Blueprint
            </h2>
            <p className="mb-8 max-w-[480px] text-base leading-[1.75] text-text-muted">
              A limited preview is free. Unlock the full personalized blueprint
              and PDF after a $5 payment — then request the services TechTivAI
              should build for you.
            </p>
            <a
              href="/analyze"
              className="btn-lime inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              Get My AI Blueprint — $5
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-8">
            <div className="mb-5 text-[0.72rem] font-bold tracking-[2px] text-text-muted uppercase">
              Report sections
            </div>
            <ul className="space-y-2.5">
              {landingBlueprintPreviewSections.map((section) => (
                <li
                  key={section}
                  className="flex items-center gap-2.5 border-b border-border-subtle/60 py-2 text-[0.9rem] text-text-primary last:border-0"
                >
                  <span className="text-brand">✓</span>
                  {section}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 10. Pricing */}
      <section id="pricing" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mx-auto mb-[70px] text-center">
          <div className="s-label">— Pricing</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Start with a $5 Blueprint.
            <br />
            Scale into delivery.
          </h2>
          <p className="mx-auto max-w-[520px] text-base leading-[1.75] text-text-muted">
            Entry product first. Implementation and ongoing advisory when
            you&apos;re ready.
          </p>
        </div>

        <LandingPricingCards />
      </section>

      {/* 11. FAQ */}
      <section id="faq" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[60px] max-w-[640px]">
          <div className="s-label">— FAQ</div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Questions before you start
          </h2>
        </div>

        <div className="mx-auto max-w-[760px] space-y-3">
          {landingFaqItems.map((item) => (
            <details
              key={item.q}
              className="scroll-reveal group rounded-surface-xl border border-border-subtle bg-surface-card px-6 py-5 open:border-border-highlight"
            >
              <summary className="cursor-pointer list-none font-display text-[1.05rem] font-semibold text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-brand-cyan transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-[0.92rem] leading-[1.7] text-text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 12. Final CTA */}
      <section id="contact" className={cn(sectionClass, "bg-bg-secondary text-center")}>
        <div className="mx-auto ">
          <div className="scroll-reveal text-center scroll-reveal relative overflow-hidden rounded-surface-xl border border-accent-lime/30 bg-surface-card px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-accent-cyan/10 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-0 size-56 rounded-full bg-[var(--hero-glow-accent)] blur-[90px]"
          />

            <div className="s-label">— Final CTA</div>
            <div className="my-6 font-display text-[clamp(2.5rem,6vw,5rem)] leading-none font-bold tracking-[-2px] text-text-primary">
              <span className="block">Your next AI move</span>
              <span className="block">
                starts with a{" "}
                <span className="text-brand">$5 Blueprint.</span>
              </span>
            </div>
            <p className="mb-9 text-base leading-[1.7] text-text-muted">
              Analyze your business, talk to the AI Consultant, and get a clear
              plan for agents, automation, web, and apps — then build with
              TechTivAI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="/analyze"
                className="btn-lime inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
                data-cursor-target
              >
                <Rocket size={18} />
                Get My AI Blueprint — $5
              </a>
              <a
                href="/contact"
                className="btn-ghost rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
                data-cursor-target
              >
                Talk to the team
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
