"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Assignee = { id: string; name: string; email: string };

export function AssignAdminForm({
  companyId,
  currentAdminId,
  assignees,
}: {
  companyId: string;
  currentAdminId: string | null;
  assignees: Assignee[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentAdminId ?? "");
  const [pending, setPending] = useState(false);

  async function onChange(next: string) {
    setValue(next);
    setPending(true);
    await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedAdminId: next || null }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <label className="block text-xs text-text-muted">
      Account manager
      <select
        className="mt-1 h-10 w-full min-w-48 rounded-xl border border-glass-border bg-bg-secondary/80 px-3 text-sm text-text-primary"
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
    </label>
  );
}
