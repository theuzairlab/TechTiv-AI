"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type LeadAssignee = { id: string; name: string; email: string };

export function LeadAssigneeSelect({
  leadId,
  currentAdminId,
  assignees,
  onAssigned,
}: {
  leadId: string;
  currentAdminId: string | null;
  assignees: LeadAssignee[];
  /** Called with the admin's name after a successful assign (for optimistic UI). */
  onAssigned?: (adminId: string | null, adminName: string | null) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentAdminId ?? "");
  const [pending, setPending] = useState(false);

  async function onChange(next: string) {
    setValue(next);
    setPending(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedAdminId: next || null }),
      });
      if (response.ok) {
        const admin = assignees.find((item) => item.id === next) ?? null;
        onAssigned?.(next || null, admin?.name ?? null);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <select
      className="h-9 rounded-lg border border-glass-border bg-bg-secondary/80 px-2 text-xs text-text-primary disabled:opacity-60"
      value={value}
      disabled={pending}
      onChange={(event) => void onChange(event.target.value)}
    >
      <option value="">Unassigned</option>
      {assignees.map((admin) => (
        <option key={admin.id} value={admin.id}>
          {admin.name}
        </option>
      ))}
    </select>
  );
}
