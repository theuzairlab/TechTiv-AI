"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, FileText } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

export type ConsultantBlueprintOption = {
  id: string;
  domain: string;
  aiScore: number | null;
  opportunityCount: number;
  topFinding: string | null;
};

type ConsultantBlueprintPickerProps = {
  selected: ConsultantBlueprintOption;
  blueprints: ConsultantBlueprintOption[];
};

export function ConsultantBlueprintPicker({
  selected,
  blueprints,
}: ConsultantBlueprintPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <GlassPanel className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Blueprint context
          </span>
          <span className="mt-0.5 block truncate font-medium text-text-primary">
            {selected.domain}
          </span>
          <span className="mt-0.5 block text-xs text-text-muted">
            {selected.aiScore != null ? `AI score ${selected.aiScore}` : "Completed"}
            {selected.opportunityCount
              ? ` · ${selected.opportunityCount} opportunities`
              : ""}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-border-subtle px-2 pb-2">
          <p className="px-2 py-2 text-xs text-text-muted">
            TivAI uses this report as memory. Open one to review what was found.
          </p>
          <ul>
            {blueprints.map((item) => {
              const active = item.id === selected.id;
              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl px-3 py-2.5",
                      active && "bg-brand-cyan/10",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setOpen(false);
                        if (!active) {
                          router.push(
                            `/dashboard/consultant?analysisId=${item.id}`,
                          );
                        }
                      }}
                    >
                      <p className="flex items-center gap-2 font-medium text-text-primary">
                        <FileText size={14} className="shrink-0 text-brand-cyan" />
                        <span className="truncate">{item.domain}</span>
                        {active ? (
                          <span className="text-[10px] uppercase tracking-wide text-brand-cyan">
                            In use
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.topFinding ??
                          `${item.opportunityCount} opportunities in this blueprint`}
                      </p>
                    </button>
                    <Link
                      href={`/dashboard/analyses/${item.id}`}
                      className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-xs text-brand-cyan no-underline hover:underline"
                    >
                      Open
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </GlassPanel>
  );
}
