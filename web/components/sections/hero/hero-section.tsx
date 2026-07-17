"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroChat } from "@/components/sections/hero/hero-chat";
import { HeroMetrics } from "@/components/sections/hero/hero-metrics";
import { siteConfig } from "@/lib/site";

const NeuralBackground = dynamic(
  () =>
    import("@/components/three/neural-background").then(
      (mod) => mod.NeuralBackground,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none absolute inset-0 bg-bg-primary"
        aria-hidden
      />
    ),
  },
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24"
    >
      <NeuralBackground />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--accent-cyan)_14%,transparent),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--accent-violet)_10%,transparent),transparent_45%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="space-y-8">
            <motion.div
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Badge variant="lime">AI-Native Automation Platform</Badge>
            </motion.div>

            <motion.h1
              custom={0.18}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
            >
              {siteConfig.tagline.split(" ").map((word, index, words) => {
                const isAccent =
                  word === "AI" ||
                  (index === words.length - 1 && word === "Business");

                return (
                  <span key={`${word}-${index}`}>
                    {isAccent ? (
                      <span className="text-gradient-cyan">{word}</span>
                    ) : (
                      word
                    )}
                    {index < words.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </motion.h1>

            <motion.p
              custom={0.26}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-xl text-base leading-relaxed text-text-muted sm:text-lg"
            >
              {siteConfig.description}
            </motion.p>

            <motion.div
              custom={0.34}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Button href="/discovery" size="lg">
                Get Your AI Blueprint
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Talk To AI Consultant
              </Button>
            </motion.div>

            <motion.div
              custom={0.42}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <HeroMetrics />
            </motion.div>
          </div>

          <motion.div
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl bg-accent-cyan/5 blur-2xl"
            />
            <HeroChat className="relative min-h-[28rem] sm:min-h-[32rem]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
