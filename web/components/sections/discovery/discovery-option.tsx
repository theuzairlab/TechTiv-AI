"use client";

import { cn } from "@/lib/utils";

type DiscoveryOptionProps = {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
};

export function DiscoveryOption({
  label,
  description,
  icon,
  selected,
  onClick,
}: DiscoveryOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60",
        selected
          ? "border-accent-cyan/50 bg-accent-cyan/10 shadow-glow-cyan"
          : "border-glass-border bg-bg-secondary/40 hover:border-accent-cyan/30 hover:bg-bg-secondary/70",
      )}
    >
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-primary/60 text-lg">
          {icon}
        </span>
      ) : (
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-accent-cyan bg-accent-cyan text-bg-primary"
              : "border-glass-border bg-transparent",
          )}
        >
          {selected ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6l2.5 2.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary sm:text-base">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-text-muted sm:text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
