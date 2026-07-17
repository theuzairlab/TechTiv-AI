"use client";

import { WorldMap } from "@/components/ui/world-map";
import { worldMapConnections } from "@/lib/trust";

export function TrustMap() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-bg-secondary/60">
      <WorldMap dots={worldMapConnections} lineColor="#3de8ff" />

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-bg-secondary/95 to-transparent p-4">
        <p className="text-center text-xs text-text-muted">
          Deploying AI systems across 5 global regions
        </p>
      </div>
    </div>
  );
}
