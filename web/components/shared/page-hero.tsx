"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  badge: string;
  badgeVariant?: "cyan" | "lime" | "violet" | "rose";
  title: React.ReactNode;
  description: string;
  features?: ReadonlyArray<{ icon: LucideIcon; label: string }>;
  className?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function PageHero({
  badge,
  badgeVariant = "cyan",
  title,
  description,
  features,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-28 pb-14 md:pt-32 md:pb-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--accent-cyan)_12%,transparent),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--accent-violet)_8%,transparent),transparent_50%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          custom={0.05}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-5"
        >
          <Badge variant={badgeVariant}>{badge}</Badge>
        </motion.div>

        <motion.h1
          custom={0.12}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-4xl font-display text-4xl font-semibold tracking-tight text-text-primary md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>

        <motion.p
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg"
        >
          {description}
        </motion.p>

        {features?.length ? (
          <motion.div
            custom={0.28}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap gap-3"
          >
            {features.map((feature) => (
              <span
                key={feature.label}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card/60 px-3.5 py-2 text-xs font-medium text-text-body backdrop-blur-sm"
              >
                <AnimatedIcon
                  icon={feature.icon}
                  size={14}
                  className="text-brand-cyan"
                  interactive={false}
                />
                {feature.label}
              </span>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
