"use client";

import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AuthForms } from "@/components/auth/auth-forms";

const highlights = [
  {
    icon: BrainCircuit,
    title: "AI-powered insights",
    description: "Lead scoring, conversation logs, and automation analytics in one place.",
  },
  {
    icon: Workflow,
    title: "Workflow monitoring",
    description: "Track n8n executions, CRM syncs, and voice AI performance live.",
  },
  {
    icon: BarChart3,
    title: "ROI dashboards",
    description: "Measure hours saved, pipeline velocity, and system uptime.",
  },
] as const;

type AuthPanelProps = {
  initialTab?: "login" | "register";
};

export function AuthPanel({ initialTab = "login" }: AuthPanelProps) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border-subtle bg-bg-secondary/50 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--accent-cyan)_14%,transparent),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--accent-lime)_8%,transparent),transparent_50%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-25" />

        <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2.5 no-underline">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-lime text-sm font-bold text-on-accent">
                T
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-text-primary">
                Techtiv<em className="logo-accent not-italic">AI</em>
              </span>
            </Link>

            <div className="mt-14 max-w-md">
              <p className="s-label">Platform access</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text-primary xl:text-5xl">
                Your AI transformation{" "}
                <span className="text-gradient-cyan">portal</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Sign in to track blueprints, proposals, and consultations. Team
                members with admin access use the internal command center.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  className="flex gap-4 rounded-xl border border-border-subtle bg-surface-card/50 p-4 backdrop-blur-sm"
                >
                  <AnimatedIcon
                    icon={item.icon}
                    size={20}
                    className="mt-0.5 shrink-0 text-brand-cyan"
                    interactive={false}
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} className="text-brand" />
              Encrypted sessions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} className="text-brand-cyan" />
              Magic link + OAuth
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} className="text-brand-cyan" />
              hello@techtivai.com
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-5 py-16 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-violet)_10%,transparent),transparent_60%)] lg:hidden"
        />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 no-underline">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-lime text-xs font-bold text-on-accent">
                T
              </span>
              <span className="font-display text-lg font-bold text-text-primary">
                Techtiv<em className="logo-accent not-italic">AI</em>
              </span>
            </Link>
          </div>

          <GlassPanel variant="elevated" className="overflow-hidden p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <AnimatedIcon icon={Sparkles} size={18} className="text-brand" interactive={false} />
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Secure access
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-bg-secondary/60 p-1">
              {(["login", "register"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTab(mode)}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tab === mode
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-body"
                  }`}
                >
                  {tab === mode ? (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-lg border border-brand-cyan/25 bg-brand-cyan/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    {mode === "login" ? "Sign in" : "Create account"}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-bg-secondary/60" />}>
                  <AuthForms mode={tab} />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </GlassPanel>

          <p className="mt-6 text-center text-xs text-text-muted">
            <User size={12} className="mr-1 inline" />
            Need help?{" "}
            <Link href="/contact" className="text-brand-cyan hover:text-brand">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
