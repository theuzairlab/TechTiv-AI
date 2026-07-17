"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import {
  formBudgetOptions,
  formIndustryOptions,
  formInterestOptions,
} from "@/lib/contact-page-data";
import { submitLead } from "@/lib/leads-client";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  interest: string;
  budget: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  industry: "",
  interest: "proposal",
  budget: "",
  message: "",
};

const selectClassName =
  "h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 text-sm text-text-primary backdrop-blur-sm transition-colors focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20";

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await submitLead({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      industry: form.industry,
      interest: form.interest,
      budget: form.budget,
      message: form.message.trim(),
      source: "contact_form",
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-surface-xl border border-brand-cyan/25 bg-brand-cyan/5 px-6 py-16 text-center"
        >
          <AnimatedIcon icon={CheckCircle2} size={40} className="mb-4 text-brand" />
          <h3 className="font-display text-xl font-semibold text-text-primary">
            Request received
          </h3>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Thanks, {form.name.split(" ")[0]}. Our team will review your request and
            send a tailored proposal within 24–48 business hours.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setForm(initialForm);
            }}
          >
            Submit another request
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="Jane Smith"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <Input
              label="Work email"
              type="email"
              placeholder="jane@company.com"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Company"
              placeholder="Acme Inc."
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="industry" className="text-sm font-medium text-text-primary">
                Industry
              </label>
              <select
                id="industry"
                className={selectClassName}
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                <option value="">Select industry</option>
                {formIndustryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="interest" className="text-sm font-medium text-text-primary">
                I&apos;m interested in
              </label>
              <select
                id="interest"
                className={selectClassName}
                value={form.interest}
                onChange={(e) => update("interest", e.target.value)}
              >
                {formInterestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="budget" className="text-sm font-medium text-text-primary">
              Estimated budget (optional)
            </label>
            <select
              id="budget"
              className={selectClassName}
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            >
              <option value="">Select range</option>
              {formBudgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-text-primary">
              Tell us about your business & goals
            </label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="What workflows are manual today? What tools do you use? What outcomes are you targeting?"
              className={cn(
                selectClassName,
                "h-auto resize-none py-3 leading-relaxed",
              )}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted">
              We respond within 24 hours · No spam, ever
            </p>
            <div className="flex flex-col items-end gap-2">
              {error ? (
                <p className="text-xs text-red-400">{error}</p>
              ) : null}
              <Button type="submit" size="lg" disabled={submitting} className="sm:min-w-[200px]">
              {submitting ? (
                "Sending…"
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Request Proposal
                </>
              )}
            </Button>
            </div>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
