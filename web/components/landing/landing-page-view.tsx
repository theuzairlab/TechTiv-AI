"use client";

import {
  ArrowRight,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { LandingWorkflowSection } from "@/components/landing/landing-workflow-section";
import {
  landingAgentForceCards,
  landingAgents,
  landingMarketingCards,
  landingPerceptionItems,
  landingProcess,
  landingResults,
  landingServices,
  landingStack,
  tickerItems,
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
  return (
    <>
      <section className="relative z-[1] grid min-h-[calc(100vh-68px)] place-items-center overflow-hidden px-[5%] pt-12 pb-20 max-md:px-[4%] max-md:pt-10 max-md:pb-[60px]">
        <div className="pointer-events-none absolute -top-[200px] -left-[200px] size-[700px] rounded-full bg-accent-cyan/[0.12] blur-[120px]" />
        <div className="pointer-events-none absolute -right-[100px] -bottom-[100px] size-[500px] rounded-full bg-[var(--hero-glow-accent)] blur-[120px]" />
        <div className="pointer-events-none absolute top-[30%] left-[55%] size-[300px] rounded-full bg-accent-cyan/[0.07] blur-[120px]" />

        <div className="relative max-w-[900px] text-center">
          <div className="hero-eyebrow mb-8 animate-fade-up">
            <AnimatedIcon icon={Zap} size={14} className="text-brand" />
            Most Advanced AI & Automation Company
          </div>

          <h1 className="mb-7 animate-fade-up font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.95] font-bold tracking-[-3px] text-text-primary [animation-delay:0.08s]">
            We Don&apos;t Just
            <br />
            <span className="text-gradient-hero">Automate.</span>
            <br />
            We <span className="text-stroke-hero">Intelligify.</span>
          </h1>

          <p className="mx-auto mb-12 max-w-[580px] animate-fade-up text-[1.1rem] leading-[1.75] text-text-muted [animation-delay:0.16s]">
            TechTivAI delivers enterprise-grade AI automation, autonomous agents,
            custom LLMs, and intelligent workflows that transform every layer of
            your business — operations, sales, data, and beyond.
          </p>

          <div className="flex animate-fade-up flex-wrap items-center justify-center gap-3.5 [animation-delay:0.24s]">
            <a
              href="#contact"
              className="btn-lime flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              <AnimatedIcon icon={Rocket} size={18} className="text-on-accent" />
              Get Your AI Roadmap — Free
            </a>
            <a
              href="#services"
              className="btn-ghost rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              <ArrowRight size={16} strokeWidth={2} />
              Explore 30+ AI Services
            </a>
          </div>

          <div className="mx-auto mt-20 flex max-w-[800px] animate-fade-up flex-wrap justify-center overflow-hidden rounded-surface-lg border border-border-subtle bg-surface-card [animation-delay:0.32s] max-md:hidden">
            {[
              ["300", "+", "AI Projects Deployed"],
              ["85", "%", "Avg. Cost Reduction"],
              ["12", "x", "Productivity Gain"],
              ["24", "/7", "AI Always On"],
            ].map(([val, unit, label], index, arr) => (
              <div
                key={label}
                className={cn(
                  "min-w-40 flex-1 px-6 py-7 text-center",
                  index < arr.length - 1 && "border-r border-border-subtle",
                )}
              >
                <div className="metric-val">
                  {val}
                  <span className="metric-unit">{unit}</span>
                </div>
                <div className="metric-lbl">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-[1] overflow-hidden border-y border-border-subtle bg-bg-secondary py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-ticker gap-12">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="ticker-item gap-2.5"
            >
              {item}{" "}
              <Sparkles size={12} className="ticker-sep" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section id="services" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Full Spectrum AI Services
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Every AI Service
            <br />
            Your Business Needs
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            30+ enterprise-grade AI services across automation, agents, models,
            data, and growth — all under one roof.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 overflow-hidden max-lg:grid-cols-2 max-md:grid-cols-1">
          {landingServices.map((service) => (
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
              <div className="svc-num mb-[22px]">
                {service.num}
              </div>
              <div
                className="svc-icon-wrap mb-[22px] flex size-[54px] items-center justify-center rounded-surface-sm text-brand-cyan transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-3 group-hover:border-accent-lime"
              >
                <AnimatedIcon icon={service.icon} size={26} className="text-brand-cyan" />
              </div>
              <div className="mb-2.5 font-display text-[1.15rem] font-semibold tracking-[-0.3px] text-text-primary">
                {service.title}
              </div>
              <div className="mb-6 text-[0.875rem] leading-[1.7] text-text-muted">
                {service.description}
              </div>
              <div className="flex flex-wrap gap-[7px]">
                {service.pills.map((pill) => (
                  <span key={pill} className="pill">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="agents" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Autonomous AI Agents
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Meet Your
            <br />
            AI Workforce
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Pre-built and custom autonomous agents ready to work across your
            entire business stack — 24/7, no breaks.
          </p>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-md:grid-cols-1">
          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-12 max-md:p-10">
            <div className="s-label">
              — Featured Agent Platform
            </div>
            <h3 className="mb-3.5 font-display text-[1.8rem] leading-tight font-bold tracking-[-0.8px] text-text-primary">
              AgentForce
              <br />
              <span className="text-brand-cyan">Enterprise Suite</span>
            </h3>
            <p className="mb-8 text-[0.9rem] leading-[1.7] text-text-muted">
              Deploy a coordinated fleet of specialized AI agents that plan,
              reason, use tools, and execute multi-step workflows autonomously.
              Built on LangGraph + CrewAI with full observability.
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
                  <div className="mb-1 text-[0.82rem] font-bold text-text-primary">{card.title}</div>
                  <div className="text-xs text-text-muted">{card.desc}</div>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="btn-lime inline-flex items-center gap-2 rounded-[10px] px-[30px] py-[15px] text-[0.9rem] no-underline"
              data-cursor-target
            >
              Deploy Your Agent Fleet →
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
                  <div className="text-[0.88rem] font-bold text-text-primary">{agent.name}</div>
                  <div className="mt-0.5 text-[0.78rem] text-text-muted">{agent.role}</div>
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

      <LandingWorkflowSection />

      <section id="data" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Data Science & AI
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Turn Raw Data Into
            <br />
            Competitive Intelligence
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            From data pipelines to production ML models — we build the full data
            + AI stack that gives you predictive power.
          </p>
        </div>

        <div className="grid grid-cols-3 grid-rows-[auto_auto] gap-5 max-md:grid-cols-1">
          <div className="scroll-reveal relative row-span-2 overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-11 transition-colors duration-300 hover:border-border-highlight max-md:row-span-1 max-md:p-9">
            <div className="s-label-sm">
              ML Engineering
            </div>
            <div className="mb-2.5 font-display text-[1.2rem] font-bold tracking-[-0.3px] text-text-primary">
              Production Machine Learning
            </div>
            <div className="text-[0.85rem] leading-[1.65] text-text-muted">
              Full-cycle ML development from problem framing to production
              deployment — classification, regression, clustering, NLP, and
              computer vision.
            </div>
            <div className="mt-6 flex gap-6">
              <div>
                <div className="font-display text-[2rem] font-bold text-metric-value">98%</div>
                <div className="text-[0.72rem] text-text-muted">Model Accuracy avg.</div>
              </div>
              <div>
                <div className="font-display text-[2rem] font-bold text-brand-strong">3x</div>
                <div className="text-[0.72rem] text-text-muted">Faster Deployment</div>
              </div>
            </div>
            <ul className="mt-6 flex list-none flex-col gap-2.5">
              {[
                "Feature Engineering & Selection",
                "Model Training & Hypertuning",
                "MLOps & Continuous Retraining",
                "A/B Testing Infrastructure",
                "Model Monitoring & Drift Detection",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[0.82rem] text-text-muted before:text-brand before:content-['→']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-9 transition-colors duration-300 hover:border-border-highlight">
            <div className="s-label-sm">
              Data Engineering
            </div>
            <div className="mb-2.5 font-display text-[1.2rem] font-bold tracking-[-0.3px] text-text-primary">
              AI Data Pipelines
            </div>
            <div className="text-[0.85rem] leading-[1.65] text-text-muted">
              Real-time and batch data pipelines that feed your AI systems with
              clean, structured data — from any source to any destination.
            </div>
            <div className="mt-6 flex h-[60px] items-end gap-[5px]">
              {[40, 60, 45, 80, 65, 90, 75, 100].map((height, index) => (
                <div
                  key={height}
                  className="flex-1 origin-bottom animate-grow-bar rounded-t-[3px] bg-gradient-to-t from-accent-cyan to-accent-cyan/30"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${(index + 1) * 0.1}s`,
                    background:
                      index === 7
                        ? "linear-gradient(0deg, var(--accent-lime), rgba(198,255,0,0.3))"
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-9 transition-colors duration-300 hover:border-border-highlight">
            <div className="s-label-sm text-brand">
              Predictive Analytics
            </div>
            <div className="mb-2.5 font-display text-[1.2rem] font-bold tracking-[-0.3px] text-text-primary">
              Business Intelligence AI
            </div>
            <div className="text-[0.85rem] leading-[1.65] text-text-muted">
              AI dashboards that auto-generate insights, detect anomalies, and
              predict outcomes — no analyst required.
            </div>
            <div className="mt-5 flex gap-6">
              <div>
                <div className="font-display text-[2rem] font-bold text-brand-strong">10x</div>
                <div className="text-[0.72rem] text-text-muted">Faster insights</div>
              </div>
            </div>
          </div>

          <div className="scroll-reveal relative col-span-2 overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-9 transition-colors duration-300 hover:border-border-highlight max-md:col-span-1">
            <div className="s-label-sm">
              NLP & Computer Vision
            </div>
            <div className="mb-2.5 font-display text-[1.2rem] font-bold tracking-[-0.3px] text-text-primary">
              Advanced AI Perception Systems
            </div>
            <div className="text-[0.85rem] leading-[1.65] text-text-muted">
              Deploy state-of-the-art NLP for document understanding, sentiment
              analysis, and entity extraction. Computer vision for quality
              control, OCR, and visual inspection at scale.
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {landingPerceptionItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border-subtle bg-surface-elevated p-3.5 text-center text-[0.72rem] text-text-muted"
                >
                  <AnimatedIcon
                    icon={item.icon}
                    size={20}
                    className="mx-auto mb-1.5 text-brand-cyan"
                  />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="marketing" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Sales & Marketing AI
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Your AI-Powered
            <br />
            Revenue Engine
          </h2>
          <p className="max-w-[520px] text-base leading-[1.75] text-text-muted">
            Replace entire GTM functions with AI — lead gen, outreach, nurture,
            conversion, and retention on autopilot.
          </p>
        </div>

        <div className="mt-[60px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {landingMarketingCards.map((card) => (
            <div
              key={card.title}
              className="scroll-reveal rounded-surface-xl border border-border-subtle bg-surface-card p-[36px_30px] transition-all duration-300 hover:-translate-y-1 hover:border-border-highlight"
            >
              <AnimatedIcon icon={card.icon} size={28} className="mb-5 text-brand-cyan" />
              <div className="mb-2.5 font-display text-[1.1rem] font-bold text-text-primary">
                {card.title}
              </div>
              <div className="mb-5 text-[0.875rem] leading-[1.7] text-text-muted">{card.desc}</div>
              <div className="flex gap-4">
                {card.kpis.map(([val, lbl]) => (
                  <div
                    key={lbl}
                    className="flex-1 rounded-lg border border-border-subtle bg-surface-elevated px-3.5 py-2.5 text-center"
                  >
                    <div className="font-display text-[1.2rem] font-bold text-brand-strong">
                      {val}
                    </div>
                    <div className="text-[0.68rem] text-text-muted">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Technology
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            The Most Advanced
            <br />
            AI Stack Available
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-5 gap-3 max-lg:grid-cols-4 max-md:grid-cols-3">
          {landingStack.map(([Icon, name, cat]) => (
            <div
              key={name}
              className="scroll-reveal cursor-default rounded-surface-md border border-border-subtle bg-surface-card px-4 py-[18px] text-center transition-all duration-200 hover:scale-[1.03] hover:border-border-highlight hover:bg-surface-elevated"
              data-cursor-target
            >
              <AnimatedIcon icon={Icon} size={24} className="mx-auto mb-2 text-brand-cyan" />
              <div className="text-[0.78rem] font-semibold text-text-body">{name}</div>
              <div className="mt-[3px] text-[0.65rem] text-text-muted">{cat}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Our Process
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            From Zero to AI-Powered
            <br />
            in 6 Weeks
          </h2>
        </div>

        <div className="relative mt-[70px] grid grid-cols-6 max-lg:grid-cols-3 max-md:grid-cols-2 before:pointer-events-none before:absolute before:top-[30px] before:right-[5%] before:left-[5%] before:h-px before:bg-border-subtle before:content-['']">
          {landingProcess.map((step) => {
            const isOngoing = "ongoing" in step;
            return (
              <div key={step.title} className="scroll-reveal px-4">
                <div
                  className={cn(
                    "relative z-[1] mx-auto my-5 flex size-5 items-center justify-center rounded-full border-2 bg-bg-secondary",
                    isOngoing ? "border-accent-lime" : "border-accent-cyan",
                  )}
                >
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      isOngoing ? "bg-ui-dot" : "bg-brand-cyan",
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "mb-2 text-center text-[0.65rem] font-bold tracking-[2px]",
                    isOngoing ? "text-brand" : "text-brand-cyan",
                  )}
                >
                  {step.num}
                </div>
                <div className="mb-2 text-center font-display text-[0.95rem] font-semibold text-text-primary">
                  {step.title}
                </div>
                <div className="text-center text-[0.78rem] leading-[1.55] text-text-muted">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="results" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mb-[70px]">
          <div className="s-label">
            — Proven Results
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Numbers That
            <br />
            Speak for Themselves
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-px overflow-hidden rounded-surface-xl border border-border-subtle">
          {landingResults.map(([num, unit, label, sub], index, arr) => (
            <div
              key={label}
              className={cn(
                "scroll-reveal bg-surface-card px-9 py-11",
                index < arr.length - 1 && "border-r border-border-subtle max-[250px]:border-r-0",
              )}
            >
              <div className="mb-2 font-display text-[3.5rem] leading-none font-bold text-text-primary">
                {num}
                <span className="result-num-unit">{unit}</span>
              </div>
              <div className="mb-1.5 text-[0.88rem] font-semibold result-label-accent">{label}</div>
              <div className="text-[0.78rem] leading-normal text-text-muted">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className={cn(sectionClass, "bg-bg-secondary")}>
        <div className="scroll-reveal mx-auto mb-[70px] max-w-[600px] text-center">
          <div className="s-label">
            — Pricing
          </div>
          <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary">
            Invest in AI.
            <br />
            Get 10x Returns.
          </h2>
          <p className="mx-auto max-w-[520px] text-base leading-[1.75] text-text-muted">
            Transparent pricing with clear ROI. No lock-ins, no surprises.
          </p>
        </div>

        <div className="mt-[60px] grid grid-cols-3 items-start gap-5 max-md:grid-cols-1">
          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-11 transition-transform duration-300 hover:-translate-y-1">
            <div className="mb-5 text-[0.7rem] font-bold tracking-[3px] text-text-muted uppercase">
              Growth
            </div>
            <div className="mb-2 flex items-start gap-1 font-display">
              <span className="pt-2 text-[1.3rem] font-semibold text-text-muted">$</span>
              <span className="text-[4rem] leading-none font-bold price-num">999</span>
              <span className="pt-7 text-[0.85rem] text-text-muted">/mo</span>
            </div>
            <div className="mb-8 text-[0.88rem] text-text-muted">
              For SMBs automating their first AI workflows
            </div>
            <hr className="my-7 border-0 border-t border-border-subtle" />
            {[
              [true, "2 AI Chatbots / Assistants"],
              [true, "10 Automated Workflows"],
              [true, "Basic RAG knowledge base"],
              [true, "CRM + Email Integration"],
              [true, "Analytics Dashboard"],
              [true, "50,000 AI interactions/mo"],
              [false, "Custom AI Agents"],
              [false, "Fine-tuned LLM"],
            ].map(([included, text]) => (
              <div
                key={String(text)}
                className="mb-3 flex items-start gap-2.5 text-[0.85rem] leading-normal text-text-muted"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 text-[0.8rem]",
                    included ? "text-brand" : "text-faint",
                  )}
                >
                  {included ? "✓" : "✗"}
                </span>
                {text}
              </div>
            ))}
            <a
              href="#contact"
              className="mt-8 block rounded-[10px] border border-border-subtle py-3.5 text-center text-[0.9rem] font-bold text-text-body no-underline transition-all duration-200 hover:border-accent-lime hover:text-brand"
              data-cursor-target
            >
              Get Started →
            </a>
          </div>

          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-accent-lime/30 bg-gradient-to-br from-accent-lime/[0.04] to-surface-card p-11 shadow-[0_0_60px_rgba(198,255,0,0.06)] transition-transform duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-7 rounded-b-lg bg-accent-lime px-3.5 py-1.5 text-[0.68rem] font-extrabold tracking-[1px] text-on-accent">
              ★ BEST VALUE
            </div>
            <div className="mb-5 text-[0.7rem] font-bold tracking-[3px] text-text-muted uppercase">
              Scale
            </div>
            <div className="mb-2 flex items-start gap-1 font-display">
              <span className="pt-2 text-[1.3rem] font-semibold text-text-muted">$</span>
              <span className="text-[4rem] leading-none font-bold price-num">1,999</span>
              <span className="pt-7 text-[0.85rem] text-text-muted">/mo</span>
            </div>
            <div className="mb-8 text-[0.88rem] text-text-muted">
              For growth companies running AI across all functions
            </div>
            <hr className="my-7 border-0 border-t border-border-subtle" />
            {[
              "Unlimited AI Bots & Assistants",
              "Unlimited Workflows",
              "5 Custom AI Agents",
              "Fine-tuned domain LLM",
              "Sales + Marketing AI Suite",
              "Data Pipeline + ML models",
              "500,000 AI interactions/mo",
              "Dedicated AI Engineer",
            ].map((text) => (
              <div
                key={text}
                className="mb-3 flex items-start gap-2.5 text-[0.85rem] leading-normal text-text-muted"
              >
                <span className="mt-0.5 shrink-0 text-[0.8rem] text-brand">✓</span>
                {text}
              </div>
            ))}
            <a
              href="#contact"
              className="btn-lime mt-8 block rounded-[10px] py-3.5 text-center text-[0.9rem] no-underline"
              data-cursor-target
            >
              Scale with AI →
            </a>
          </div>

          <div className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card p-11 transition-transform duration-300 hover:-translate-y-1">
            <div className="mb-5 text-[0.7rem] font-bold tracking-[3px] text-text-muted uppercase">
              Enterprise
            </div>
            <div className="mb-2 flex items-center font-display">
              <span className="text-[2.5rem] leading-none font-bold text-text-primary">Custom</span>
            </div>
            <div className="mb-8 text-[0.88rem] text-text-muted">
              Full AI transformation for large organizations
            </div>
            <hr className="my-7 border-0 border-t border-border-subtle" />
            {[
              "Unlimited everything",
              "Custom AI agent fleet",
              "Proprietary LLM training",
              "On-premise / private cloud",
              "Dedicated AI team (3+ engineers)",
              "SLA + 99.9% uptime guarantee",
              "White-label options",
              "Board-level AI strategy",
            ].map((text) => (
              <div
                key={text}
                className="mb-3 flex items-start gap-2.5 text-[0.85rem] leading-normal text-text-muted"
              >
                <span className="mt-0.5 shrink-0 text-[0.8rem] text-brand">✓</span>
                {text}
              </div>
            ))}
            <a
              href="#contact"
              className="mt-8 block rounded-[10px] border border-border-subtle py-3.5 text-center text-[0.9rem] font-bold text-text-body no-underline transition-all duration-200 hover:border-accent-lime hover:text-brand"
              data-cursor-target
            >
              Talk to Sales →
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className={cn(sectionClass, "bg-bg-secondary text-center")}>
        <div className="mx-auto max-w-[680px]">
          <div className="scroll-reveal text-center">
            <div className="s-label">
              — Let&apos;s Build Together
            </div>
            <div className="my-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-bold tracking-[-2px] text-text-primary">
              <span className="block">Your Business,</span>
              <span className="block">
                <span className="text-brand-cyan">Powered</span> by
              </span>
              <span className="block">
                <span className="text-brand">AI.</span>
              </span>
            </div>
            <p className="mb-9 text-base leading-[1.7] text-text-muted">
              Book a free 45-minute AI Strategy Session. We&apos;ll map out
              exactly which AI solutions will drive the most ROI for your business
              — no pitch, just value.
            </p>

            <form
              className="mx-auto flex max-w-[440px] flex-wrap justify-center gap-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your work email"
                className="min-w-[200px] flex-1 rounded-[10px] border border-border-subtle bg-surface-elevated px-5 py-3.5 font-[inherit] text-[0.9rem] text-text-body outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-border-highlight"
              />
              <button
                type="submit"
                className="btn-lime cursor-pointer rounded-[10px] border-none px-7 py-3.5 text-[0.9rem]"
                data-cursor-target
              >
                Book Free Session →
              </button>
            </form>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {[
                "✓ No commitment",
                "✓ 45-min strategy call",
                "✓ Custom AI roadmap",
                "✓ Response in 2hrs",
              ].map((pill) => (
                <div
                  key={pill}
                  className="flex items-center gap-[7px] rounded-full border border-border-subtle bg-surface-elevated px-5 py-2.5 text-[0.82rem] font-medium text-text-muted"
                >
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
