"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import {
  landingFlowCategories,
  landingWorkflowNodes,
} from "@/lib/landing-page-data";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const sectionClass =
  "relative z-[1] px-[5%] py-[110px] max-md:px-[4%] max-md:py-20 bg-bg-secondary";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function WorkflowConnector({
  label,
  pulseDelay,
  reducedMotion,
}: {
  label: string;
  pulseDelay: number;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative flex min-w-[64px] flex-1 max-w-[88px] shrink-0 flex-col items-center justify-center self-center px-0.5 max-md:min-w-[52px]">
      <span className="mb-4 rounded-full border border-border-highlight bg-surface-card/90 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.08em] whitespace-nowrap text-brand-cyan uppercase backdrop-blur-sm">
        {label}
      </span>
      <div className="relative h-px w-full overflow-visible bg-gradient-to-r from-border-subtle via-accent-cyan/35 to-border-subtle">
        {!reducedMotion ? (
          <motion.span
            className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(61,232,255,0.8)]"
            animate={{ left: ["0%", "100%"], opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: pulseDelay,
              ease: "easeInOut",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function LandingWorkflowSection() {
  const reducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setActiveStep((step) => (step + 1) % landingWorkflowNodes.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <section id="workflow" className={sectionClass}>
      <div className="mx-auto max-w-[1180px]">
        <motion.div
          className="scroll-reveal mb-12 max-w-3xl md:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={containerVariants}
        >
          <motion.div variants={fadeUp} className="s-label">
            Workflow Automation
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mb-4 font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] font-bold tracking-[-1.5px] text-text-primary"
          >
            Automate Any Process.
            <br />
            <span className="text-gradient-hero">Connect Everything.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="max-w-[560px] text-base leading-[1.75] text-text-muted"
          >
            From simple Zaps to complex multi-system orchestrations — our AI
            Workflow Engine automates it all with intelligent decision logic.
          </motion.p>
        </motion.div>

        <motion.div
          className="scroll-reveal relative overflow-hidden rounded-surface-xl border border-border-subtle bg-surface-card px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-accent-cyan/10 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-0 size-56 rounded-full bg-[var(--hero-glow-accent)] blur-[90px]"
          />

          <div className="relative mb-14">
            <p className="mb-6 text-center text-[0.68rem] font-bold tracking-[0.2em] text-text-muted uppercase">
              Live pipeline preview
            </p>

            <div className="flex items-center justify-center overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center justify-center px-2">
                {landingWorkflowNodes.map((node, index) => {
                  const isHighlighted = activeStep === index;
                  const accent =
                    "active" in node && node.active === "lime"
                      ? "lime"
                      : "active" in node && node.active === "cyan"
                        ? "cyan"
                        : isHighlighted
                          ? "cyan"
                          : null;

                  return (
                    <div key={node.label} className="contents">
                      <motion.div
                        className={cn(
                          "relative w-[148px] shrink-0 rounded-surface-md border bg-surface-elevated px-4 py-5 text-center transition-colors duration-300",
                          accent === "cyan" &&
                            "border-accent-cyan/70 shadow-[0_0_28px_rgba(61,232,255,0.14)]",
                          accent === "lime" &&
                            "border-accent-lime/70 shadow-[0_0_28px_rgba(198,255,0,0.14)]",
                          !accent && "border-border-subtle hover:border-border-highlight",
                        )}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.45 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        animate={
                          !reducedMotion && isHighlighted && !("active" in node)
                            ? {
                                boxShadow: [
                                  "0 0 0px rgba(61,232,255,0)",
                                  "0 0 24px rgba(61,232,255,0.18)",
                                  "0 0 0px rgba(61,232,255,0)",
                                ],
                              }
                            : undefined
                        }
                      >
                        {isHighlighted ? (
                          <motion.span
                            layoutId="workflow-active-ring"
                            className={cn(
                              "pointer-events-none absolute inset-0 rounded-surface-md border-2",
                              accent === "lime"
                                ? "border-accent-lime/40"
                                : "border-accent-cyan/40",
                            )}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                          />
                        ) : null}

                        <AnimatedIcon
                          icon={node.icon}
                          size={26}
                          className={cn(
                            "relative z-[1] mx-auto mb-2.5",
                            accent === "lime"
                              ? "text-brand"
                              : accent
                                ? "text-brand-cyan"
                                : "text-text-muted",
                          )}
                        />
                        <div className="relative z-[1] text-[0.8rem] font-semibold text-text-primary">
                          {node.label}
                        </div>
                        <div className="relative z-[1] mt-1 text-[0.68rem] leading-snug text-text-muted">
                          {node.sub}
                        </div>
                      </motion.div>

                      {node.trigger ? (
                        <WorkflowConnector
                          label={node.trigger}
                          pulseDelay={index * 0.35}
                          reducedMotion={!!reducedMotion}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mx-auto mb-10 h-px max-w-3xl bg-gradient-to-r from-transparent via-border-highlight to-transparent" />

          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {landingFlowCategories.map((category) => (
              <motion.div
                key={category.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="group relative overflow-hidden rounded-surface-md border border-border-subtle bg-surface-elevated p-5 transition-colors duration-300 hover:border-border-highlight hover:bg-surface-card"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-cyan/0 to-accent-lime/0 opacity-0 transition-opacity duration-300 group-hover:from-accent-cyan/6 group-hover:to-accent-lime/4 group-hover:opacity-100"
                />
                <div className="relative flex size-10 items-center justify-center rounded-surface-sm border border-border-subtle bg-surface-card/80">
                  <AnimatedIcon
                    icon={category.icon}
                    size={20}
                    className="text-brand-cyan"
                  />
                </div>
                <div className="relative mt-4 mb-1.5 text-[0.88rem] font-bold text-text-primary">
                  {category.title}
                </div>
                <div className="relative text-[0.78rem] leading-relaxed text-text-muted">
                  {category.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
