"use client";

import { useState } from "react";
import { AlertCircle, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import type { ProviderMonitorRow } from "@/lib/admin/providers";
import { cn } from "@/lib/utils";

type AdminProvidersManagerProps = {
  initialProviders: ProviderMonitorRow[];
};

export function AdminProvidersManager({
  initialProviders,
}: AdminProvidersManagerProps) {
  const [providers, setProviders] = useState(initialProviders);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patchProvider(
    provider: string,
    body: {
      isEnabled?: boolean;
      monthlyBudgetUSD?: number;
      resetSpend?: boolean;
    },
  ) {
    setSavingProvider(provider);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/providers/${encodeURIComponent(provider)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = (await response.json()) as ProviderMonitorRow & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Update failed");
      }
      setProviders((rows) =>
        rows.map((row) => (row.provider === provider ? payload : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingProvider(null);
    }
  }

  const totalSpend = providers.reduce(
    (sum, row) => sum + row.currentSpendUSD,
    0,
  );
  const totalFailures = providers.reduce(
    (sum, row) => sum + row.failuresThisMonth,
    0,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="Infrastructure"
        title="Providers"
        description="Monitor API spend, failure rates, and enable or disable pipeline providers."
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassPanel className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Total spend (configs)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            ${totalSpend.toFixed(2)}
          </p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Failures this month
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            {totalFailures}
          </p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Enabled providers
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            {providers.filter((row) => row.isEnabled).length} / {providers.length}
          </p>
        </GlassPanel>
      </div>

      <div className="grid gap-4">
        {providers.map((row) => (
          <ProviderCard
            key={row.provider}
            row={row}
            saving={savingProvider === row.provider}
            onToggle={(enabled) =>
              patchProvider(row.provider, { isEnabled: enabled })
            }
            onResetSpend={() => patchProvider(row.provider, { resetSpend: true })}
            onBudgetChange={(budget) =>
              patchProvider(row.provider, { monthlyBudgetUSD: budget })
            }
          />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({
  row,
  saving,
  onToggle,
  onResetSpend,
  onBudgetChange,
}: {
  row: ProviderMonitorRow;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
  onResetSpend: () => void;
  onBudgetChange: (budget: number) => void;
}) {
  const [budgetInput, setBudgetInput] = useState(String(row.monthlyBudgetUSD));

  return (
    <GlassPanel variant="elevated" className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {row.provider}
            </h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                row.isEnabled
                  ? "bg-accent-lime/15 text-accent-lime"
                  : "bg-text-muted/15 text-text-muted",
              )}
            >
              {row.isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Spend" value={`$${row.currentSpendUSD.toFixed(2)}`} />
            <Stat
              label="Budget"
              value={`$${row.monthlyBudgetUSD.toFixed(0)}`}
            />
            <Stat label="Calls (month)" value={String(row.callsThisMonth)} />
            <Stat label="Failures (month)" value={String(row.failuresThisMonth)} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
              <span>Budget used</span>
              <span>{row.spendPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  row.spendPercent >= 90
                    ? "bg-destructive"
                    : "bg-gradient-to-r from-brand-cyan to-brand",
                )}
                style={{ width: `${Math.min(100, row.spendPercent)}%` }}
              />
            </div>
          </div>

          {row.avgLatencyMs != null ? (
            <p className="mt-3 text-xs text-text-muted">
              Avg latency this month: {Math.round(row.avgLatencyMs)}ms · Rate
              limit: {row.rateLimitPerMinute}/min
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-56">
          <Button
            type="button"
            variant={row.isEnabled ? "outline" : "primary"}
            disabled={saving}
            onClick={() => onToggle(!row.isEnabled)}
          >
            {row.isEnabled ? "Disable" : "Enable"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onResetSpend}
          >
            <RefreshCw size={14} className={cn(saving && "animate-spin")} />
            Reset spend
          </Button>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="number"
                min={0}
                step={1}
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
                className="h-10 w-full rounded-xl border border-glass-border bg-bg-secondary/80 pl-8 pr-3 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                const budget = Number(budgetInput);
                if (!Number.isFinite(budget) || budget < 0) return;
                onBudgetChange(budget);
              }}
            >
              Set
            </Button>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
