"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import type { BusinessIntake } from "@/lib/analysis/schema";

export type IntakeFormValues = {
  domain: string;
  companyName: string;
  industry: string;
  city: string;
  region: string;
  country: string;
  teamSize: string;
  goals: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  website: string;
  additionalNotes: string;
};

const defaultValues: IntakeFormValues = {
  domain: "",
  companyName: "",
  industry: "",
  city: "",
  region: "",
  country: "",
  teamSize: "",
  goals: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  website: "",
  additionalNotes: "",
};

type BusinessIntakeWizardProps = {
  loading?: boolean;
  onSubmit: (values: IntakeFormValues) => void;
};

const STEPS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "presence", label: "Digital presence", icon: Globe },
  { id: "context", label: "Context", icon: Sparkles },
] as const;

export function BusinessIntakeWizard({
  loading = false,
  onSubmit,
}: BusinessIntakeWizardProps) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<IntakeFormValues>(defaultValues);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<IntakeFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const hasPresence =
    values.domain.trim() ||
    values.website.trim() ||
    [values.facebook, values.instagram, values.linkedin, values.twitter, values.tiktok, values.youtube].some(
      (v) => v.trim(),
    );

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!values.companyName.trim()) {
        setError("Company name helps us personalize your intelligence report.");
        return false;
      }
    }
    if (step === 1) {
      if (!hasPresence) {
        setError("Add your website domain or at least one social profile URL.");
        return false;
      }
      if (
        !values.domain.trim() &&
        !values.website.trim() &&
        hasPresence &&
        !values.companyName.trim()
      ) {
        setError("Company name is required when sharing social profiles without a website.");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (!validateStep()) return;
    if (!hasPresence) {
      setError("Add your website or social profiles to begin analysis.");
      return;
    }
    onSubmit(values);
  };

  return (
    <GlassPanel variant="elevated" className="overflow-hidden p-0">
      <div className="border-b border-border-subtle/60 bg-bg-secondary/30 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-cyan">
          AI business intelligence
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
          Tell us about your business
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          No email required to start — we&apos;ll ask during processing so we can
          deliver your blueprint.
        </p>

        <div className="mt-5 flex gap-2">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const done = index < step;
            return (
              <div
                key={item.id}
                className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                    : done
                      ? "border-brand/25 bg-brand/5 text-brand"
                      : "border-border-subtle text-text-muted"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {step === 0 ? (
              <>
                <Input
                  label="Company name"
                  placeholder="Acme Inc"
                  required
                  value={values.companyName}
                  onChange={(e) => update({ companyName: e.target.value })}
                />
                <Input
                  label="Industry"
                  placeholder="E-commerce, SaaS, Healthcare…"
                  value={values.industry}
                  onChange={(e) => update({ industry: e.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    placeholder="Austin"
                    value={values.city}
                    onChange={(e) => update({ city: e.target.value })}
                  />
                  <Input
                    label="State / Region"
                    placeholder="TX"
                    value={values.region}
                    onChange={(e) => update({ region: e.target.value })}
                  />
                  <Input
                    label="Country"
                    placeholder="United States"
                    value={values.country}
                    onChange={(e) => update({ country: e.target.value })}
                  />
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Input
                  label="Primary website domain"
                  placeholder="acme.com"
                  value={values.domain}
                  onChange={(e) => update({ domain: e.target.value })}
                  hint="We'll crawl and audit your site automatically"
                  autoComplete="url"
                />
                <Input
                  label="Full website URL (optional)"
                  placeholder="https://www.acme.com"
                  value={values.website}
                  onChange={(e) => update({ website: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <Share2 size={14} className="text-brand-cyan" />
                  Social profiles
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["linkedin", "LinkedIn URL"],
                      ["instagram", "Instagram URL"],
                      ["facebook", "Facebook URL"],
                      ["twitter", "X / Twitter URL"],
                      ["tiktok", "TikTok URL"],
                      ["youtube", "YouTube URL"],
                    ] as const
                  ).map(([key, label]) => (
                    <Input
                      key={key}
                      label={label}
                      placeholder={`https://${key}.com/...`}
                      value={values[key]}
                      onChange={(e) => update({ [key]: e.target.value })}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Input
                  label="Team size (optional)"
                  placeholder="1-10, 11-50, 50+…"
                  value={values.teamSize}
                  onChange={(e) => update({ teamSize: e.target.value })}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Top goals (optional)
                  </label>
                  <textarea
                    value={values.goals}
                    onChange={(e) => update({ goals: e.target.value })}
                    placeholder="Grow leads, automate support, improve SEO visibility…"
                    rows={3}
                    className="w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-3 text-sm text-text-primary backdrop-blur-sm focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Anything else we should know?
                  </label>
                  <textarea
                    value={values.additionalNotes}
                    onChange={(e) => update({ additionalNotes: e.target.value })}
                    placeholder="Key products, target customers, current tools…"
                    rows={3}
                    className="w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-3 text-sm text-text-primary backdrop-blur-sm focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
                  />
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || loading}
            onClick={back}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} disabled={loading}>
              Continue
              <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Starting intelligence session…" : "Start deep analysis"}
              <Sparkles size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

export function intakeValuesToPayload(values: IntakeFormValues): {
  domain?: string;
  company?: string;
  businessIntake: BusinessIntake;
} {
  const goals = values.goals
    .split(/[\n,]/)
    .map((g) => g.trim())
    .filter(Boolean);

  return {
    domain: values.domain.trim() || undefined,
    company: values.companyName.trim() || undefined,
    businessIntake: {
      companyName: values.companyName.trim() || undefined,
      industry: values.industry.trim() || undefined,
      location: {
        city: values.city.trim() || undefined,
        region: values.region.trim() || undefined,
        country: values.country.trim() || undefined,
      },
      teamSize: values.teamSize.trim() || undefined,
      goals: goals.length > 0 ? goals : undefined,
      additionalNotes: values.additionalNotes.trim() || undefined,
      socialLinks: {
        website: values.website.trim() || undefined,
        facebook: values.facebook.trim() || undefined,
        instagram: values.instagram.trim() || undefined,
        linkedin: values.linkedin.trim() || undefined,
        twitter: values.twitter.trim() || undefined,
        tiktok: values.tiktok.trim() || undefined,
        youtube: values.youtube.trim() || undefined,
      },
    },
  };
}
