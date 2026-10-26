"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayNowButton({
  analysisId,
}: {
  analysisId: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!analysisId) {
    return (
      <Button href="/dashboard/analyze" size="sm">
        Pay now
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError(null);
          void fetch("/api/payments/checkout", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              analysisId,
              returnPath: "/dashboard/billing",
            }),
          })
            .then(async (response) => {
              const body = (await response.json()) as { url?: string; error?: string };
              if (!response.ok || !body.url) {
                throw new Error(body.error ?? "Could not open checkout");
              }
              window.location.href = body.url;
            })
            .catch((err: unknown) => {
              setPending(false);
              setError(err instanceof Error ? err.message : "Could not open checkout");
            });
        }}
      >
        {pending ? "Opening checkout…" : "Pay now"}
      </Button>
      {error ? <p className="max-w-xs text-right text-xs text-accent-rose">{error}</p> : null}
    </div>
  );
}
