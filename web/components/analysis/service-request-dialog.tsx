"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ServiceRequestItem = {
  problem: string;
  service: string;
  techStack: string[];
  estimatedScope: string;
  estimatedTimelineWeeks: number;
  ctaLabel: string;
};

type ServiceRequestDialogProps = {
  analysisId: string;
  domain: string;
  defaultEmail?: string | null;
  item: ServiceRequestItem;
};

export function ServiceRequestDialog({
  analysisId,
  domain,
  defaultEmail,
  item,
}: ServiceRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => {
    if (status === "submitting") return;
    setOpen(false);
    setStatus("idle");
    setErrorMessage(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: domain,
          interest: "proposal",
          message: [
            `Requested service: ${item.service}`,
            notes.trim() ? `Notes: ${notes.trim()}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          source: "service_request",
          metadata: {
            analysisId,
            analysisDomain: domain,
            service: item.service,
            problem: item.problem,
            techStack: item.techStack,
            estimatedScope: item.estimatedScope,
            estimatedTimelineWeeks: item.estimatedTimelineWeeks,
            ctaLabel: item.ctaLabel,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not submit your request");
      }
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Could not submit your request",
      );
    }
  };

  const dialogBody =
    status === "done" ? (
      <div className="py-6 text-center">
        <CheckCircle2 size={36} className="mx-auto text-brand-cyan" />
        <p className="mt-4 text-lg font-semibold text-text-primary">Request sent</p>
        <p className="mt-2 text-base text-text-muted">
          A TechTivAI consultant will reach out about your {item.service} request for{" "}
          {domain}.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Want to move faster? Book a strategy call now instead of waiting for
          a reply.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button href="/contact#schedule" onClick={close}>
            Book a call now
          </Button>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    ) : (
      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">
            Build this with TechTivAI
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">
            {item.service}
          </h3>
          <p className="mt-2 text-sm text-text-muted">{item.problem}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 555 000 0000"
        />
        <div className="flex w-full flex-col gap-2">
          <label
            htmlFor="service-request-notes"
            className="text-sm font-medium text-text-primary"
          >
            Anything else we should know? (optional)
          </label>
          <textarea
            id="service-request-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Timeline constraints, budget, priorities…"
            className={cn(
              "w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm transition-colors",
              "focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20",
            )}
          />
        </div>

        {errorMessage ? <p className="text-sm text-accent-rose">{errorMessage}</p> : null}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" /> Sending…
              </>
            ) : (
              "Send request"
            )}
          </Button>
        </div>
      </form>
    );

  const modal = (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <GlassPanel
        variant="elevated"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {dialogBody}
      </GlassPanel>
    </div>
  );

  return (
    <>
      <Button size="sm" className="mt-3" onClick={() => setOpen(true)}>
        {item.ctaLabel}
      </Button>

      {open && mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
