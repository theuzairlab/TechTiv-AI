"use client";

import { useEffect, useRef } from "react";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? "";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }) => void;
    };
  }
}

function withEmbedTheme(url: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("background_color")) {
    parsed.searchParams.set("background_color", "0a0a0a");
  }
  if (!parsed.searchParams.has("text_color")) {
    parsed.searchParams.set("text_color", "e5e5e5");
  }
  if (!parsed.searchParams.has("primary_color")) {
    parsed.searchParams.set("primary_color", "c8ff00");
  }
  parsed.searchParams.set("hide_gdpr_banner", "1");
  return parsed.toString();
}

const WIDGET_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

function loadCalendlyScript(): Promise<void> {
  if (window.Calendly) return Promise.resolve();

  const existing = document.querySelector(`script[src="${WIDGET_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve) => {
      if (window.Calendly) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly widget"));
    document.body.appendChild(script);
  });
}

export function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CALENDLY_URL || !containerRef.current) return;

    const parent = containerRef.current;
    const embedUrl = withEmbedTheme(CALENDLY_URL);
    let cancelled = false;

    const init = async () => {
      try {
        await loadCalendlyScript();
        if (cancelled || !containerRef.current) return;

        parent.innerHTML = "";
        window.Calendly?.initInlineWidget({
          url: embedUrl,
          parentElement: parent,
          resize: true,
        });
      } catch {
        // Widget script failed — empty state stays visible
      }
    };

    void init();

    return () => {
      cancelled = true;
      parent.innerHTML = "";
    };
  }, []);

  if (!CALENDLY_URL) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-surface-xl border border-border-subtle bg-bg-secondary/30 p-8 text-center">
        <p className="text-sm text-text-muted">
          Scheduling is not configured yet. Set{" "}
          <code className="text-brand-cyan">NEXT_PUBLIC_CALENDLY_URL</code> in your
          environment.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget w-full min-w-[320px]"
      style={{ minHeight: 700, height: 700 }}
    />
  );
}
