"use client";

import { useRouter } from "next/navigation";
import {
  IMPLEMENTATION_STATUSES,
  implementationStatusLabels,
  type ImplementationStatus,
} from "@/lib/implementation";

export function ImplementationStatusSelect({
  leadId,
  value,
}: {
  leadId: string;
  value: ImplementationStatus | null;
}) {
  const router = useRouter();

  async function onChange(next: string) {
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        implementationStatus: next || null,
      }),
    });
    router.refresh();
  }

  return (
    <select
      className="h-9 rounded-lg border border-glass-border bg-bg-secondary/80 px-2 text-xs text-text-primary"
      value={value ?? "REQUESTED"}
      onChange={(event) => void onChange(event.target.value)}
    >
      {IMPLEMENTATION_STATUSES.map((status) => (
        <option key={status} value={status}>
          {implementationStatusLabels[status]}
        </option>
      ))}
    </select>
  );
}
