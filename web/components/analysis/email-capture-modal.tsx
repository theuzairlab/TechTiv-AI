"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureAnalysisEmailRequest } from "@/lib/analysis/client";

type EmailCaptureModalProps = {
  open: boolean;
  analysisId: string;
  guestAccessToken: string;
  onClose: () => void;
  onCaptured: (email: string) => void;
};

export function EmailCaptureModal({
  open,
  analysisId,
  guestAccessToken,
  onClose,
  onCaptured,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await captureAnalysisEmailRequest({
        analysisId,
        guestAccessToken,
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
      });
      onCaptured(result.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-cyan/25 bg-bg-primary shadow-2xl"
      >
        <div className="border-b border-border-subtle/60 bg-gradient-to-r from-brand-cyan/10 to-brand/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary/60"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 text-brand-cyan">
            <Sparkles size={18} />
            <p className="text-[10px] font-semibold uppercase tracking-wide">
              While we work
            </p>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold text-text-primary">
            Get your full blueprint delivered
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Your analysis is running now. Add your email and we&apos;ll send a
            secure magic link when your advanced report is ready — plus you can
            unlock the full PDF from your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Input
            label="Work email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Your name (optional)"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />

          {error ? (
            <p className="text-sm text-accent-rose">{error}</p>
          ) : null}

          <div className="flex items-start gap-2 rounded-xl border border-border-subtle bg-bg-secondary/40 p-3 text-xs text-text-muted">
            <Lock size={14} className="mt-0.5 shrink-0 text-brand-cyan" />
            <span>
              Basic insights appear on this page when processing completes.
              Sign in for the advanced report, PDF download, and sharing.
            </span>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Mail size={16} className="mr-2" />
            {loading ? "Saving…" : "Send my blueprint when ready"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
