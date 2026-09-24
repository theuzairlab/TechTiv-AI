"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MessageClientButton({
  userId,
  relatedLeadId,
}: {
  userId: string;
  relatedLeadId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          relatedLeadId,
        }),
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Could not open conversation");
      }
      router.push(`/admin/inbox?id=${payload.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open conversation");
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" onClick={handleClick} disabled={pending}>
        {pending ? "Opening…" : "Message the client"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
