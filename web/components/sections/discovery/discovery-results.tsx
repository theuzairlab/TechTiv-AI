"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { AnimatedMetric } from "@/components/animations/animated-metric";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import type { DiscoveryAnswers, DiscoveryResult } from "@/lib/discovery";
import { submitLead } from "@/lib/leads-client";

type DiscoveryResultsProps = {
  result: DiscoveryResult;
  answers: DiscoveryAnswers;
  onRestart: () => void;
};

export function DiscoveryResults({
  result,
  answers,
  onRestart,
}: DiscoveryResultsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveBlueprint = async () => {
    if (!name.trim() || !email.trim()) return;

    setSaving(true);
    setError(null);

    const submitResult = await submitLead({
      name: name.trim(),
      email: email.trim(),
      interest: "proposal",
      message: result.summary,
      source: "discovery",
      discoveryAnswers: answers,
      metadata: {
        roi: result.roi,
        recommendations: result.recommendations.map((rec) => ({
          id: rec.id,
          label: rec.label,
        })),
      },
    });

    setSaving(false);

    if (!submitResult.success) {
      setError(submitResult.error);
      return;
    }

    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="space-y-3 text-center sm:text-left">
        <Badge variant="lime">Your AI Blueprint</Badge>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Recommended AI Systems
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          {result.summary}
        </p>
      </div>

      <StaggerChildren className="grid gap-3 sm:grid-cols-2">
        {result.recommendations.map((rec) => (
          <StaggerItem key={rec.id}>
            <GlassPanel className="h-full p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-violet/15 text-xs font-bold text-accent-violet ring-1 ring-accent-violet/30">
                  AI
                </span>
                <div>
                  <p className="font-medium text-text-primary">{rec.label}</p>
                  <p className="mt-1 text-sm text-text-muted">{rec.description}</p>
                </div>
              </div>
            </GlassPanel>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold tracking-tight">
          Projected ROI
        </h4>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AnimatedMetric
            value={result.roi.hoursSavedPerWeek}
            suffix=" hrs"
            label="Hours saved / week"
            delay={0.1}
          />
          <AnimatedMetric
            value={result.roi.monthlySavings}
            label="Monthly savings"
            format="currency"
            delay={0.18}
          />
          <AnimatedMetric
            value={result.roi.revenueIncreasePercent}
            label="Revenue increase potential"
            format="percent"
            delay={0.26}
          />
          <AnimatedMetric
            value={result.roi.impactScore}
            suffix="/100"
            label="Automation impact score"
            delay={0.34}
          />
        </div>
      </div>

      {saved ? (
        <GlassPanel className="flex flex-col items-center px-6 py-10 text-center">
          <AnimatedIcon icon={CheckCircle2} size={36} className="mb-3 text-brand" />
          <h4 className="font-display text-lg font-semibold text-text-primary">
            Blueprint saved
          </h4>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Thanks, {name.split(" ")[0]}. Our team will follow up with your
            personalized AI blueprint within 24 hours.
          </p>
        </GlassPanel>
      ) : (
        <GlassPanel className="space-y-4 p-6">
          <div>
            <h4 className="font-display text-lg font-semibold text-text-primary">
              Save your blueprint
            </h4>
            <p className="mt-1 text-sm text-text-muted">
              Enter your details and we&apos;ll send your full AI recommendations
              and ROI breakdown.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="Jane Smith"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Work email"
              type="email"
              placeholder="jane@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <Button
            size="lg"
            disabled={saving || !name.trim() || !email.trim()}
            onClick={handleSaveBlueprint}
          >
            {saving ? "Saving…" : "Save My Blueprint"}
          </Button>
        </GlassPanel>
      )}

      <div className="flex flex-col gap-3 border-t border-glass-border pt-6 sm:flex-row sm:flex-wrap">
        <Button href="/contact" variant="secondary" size="lg">
          Book Strategy Call
        </Button>
        <Button variant="ghost" size="lg" onClick={onRestart}>
          Start Over
        </Button>
      </div>
    </motion.div>
  );
}
