"use client";

import { useMemo, useState } from "react";
import { hubService, serviceConnections, services } from "@/lib/services";
import { ServiceConnections } from "@/components/sections/services/service-connections";
import { ServiceDetailPanel } from "@/components/sections/services/service-detail-panel";
import { ServiceNode } from "@/components/sections/services/service-node";

function ServiceGraph({
  activeId,
  hoveredId,
  connectedIds,
  onSelect,
  onHover,
  onLeave,
}: {
  activeId: string;
  hoveredId: string | null;
  connectedIds: Set<string>;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="relative mx-auto aspect-video w-full max-w-5xl overflow-visible"
      onMouseLeave={onLeave}
    >
      <ServiceConnections activeId={activeId} hoveredId={hoveredId} />

      {services.map((service) => (
        <div key={service.id} onMouseEnter={() => onHover(service.id)}>
          <ServiceNode
            service={service}
            active={activeId === service.id}
            connected={connectedIds.has(service.id)}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

export function ServiceEcosystem() {
  const [activeId, setActiveId] = useState(hubService.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeService = useMemo(
    () => services.find((s) => s.id === activeId) ?? hubService,
    [activeId],
  );

  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const connection of serviceConnections) {
      if (connection.from === activeId) ids.add(connection.to);
      if (connection.to === activeId) ids.add(connection.from);
    }
    return ids;
  }, [activeId]);

  return (
    <div className="space-y-8">
      {/* Desktop / tablet — graph then details */}
      <div className="hidden space-y-8 md:block">
        <ServiceGraph
          activeId={activeId}
          hoveredId={hoveredId}
          connectedIds={connectedIds}
          onSelect={setActiveId}
          onHover={setHoveredId}
          onLeave={() => setHoveredId(null)}
        />
        <ServiceDetailPanel service={activeService} />
      </div>

      {/* Mobile — card grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:hidden">
        {services.map((service) => (
          <ServiceNode
            key={service.id}
            service={service}
            active={activeId === service.id}
            connected={connectedIds.has(service.id)}
            onSelect={setActiveId}
            compact
          />
        ))}
      </div>

      <div className="md:hidden">
        <ServiceDetailPanel service={activeService} />
      </div>
    </div>
  );
}
