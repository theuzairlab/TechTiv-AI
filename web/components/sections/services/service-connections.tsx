"use client";

import { motion } from "framer-motion";
import type { Service } from "@/lib/services";
import { serviceConnections, services } from "@/lib/services";

type ServiceConnectionsProps = {
  activeId: string;
  hoveredId: string | null;
};

function getNodeCenter(service: Service) {
  return { x: service.position.x, y: service.position.y };
}

export function ServiceConnections({
  activeId,
  hoveredId,
}: ServiceConnectionsProps) {
  const highlightId = hoveredId ?? activeId;

  const connectedIds = new Set<string>();
  for (const connection of serviceConnections) {
    if (connection.from === highlightId) connectedIds.add(connection.to);
    if (connection.to === highlightId) connectedIds.add(connection.from);
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {serviceConnections.map((connection) => {
        const from = services.find((s) => s.id === connection.from);
        const to = services.find((s) => s.id === connection.to);
        if (!from || !to) return null;

        const fromPoint = getNodeCenter(from);
        const toPoint = getNodeCenter(to);
        const isHighlighted =
          connection.from === highlightId ||
          connection.to === highlightId ||
          (connectedIds.has(connection.from) && connectedIds.has(connection.to));

        return (
          <motion.line
            key={`${connection.from}-${connection.to}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            vectorEffect="non-scaling-stroke"
            stroke="var(--accent-cyan)"
            strokeWidth={isHighlighted ? 1.5 : 1}
            strokeOpacity={isHighlighted ? 0.55 : 0.12}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        );
      })}

      {serviceConnections
        .filter(
          (c) => c.from === highlightId || c.to === highlightId,
        )
        .map((connection) => {
          const from = services.find((s) => s.id === connection.from);
          const to = services.find((s) => s.id === connection.to);
          if (!from || !to) return null;

          const fromPoint = getNodeCenter(from);
          const toPoint = getNodeCenter(to);

          return (
            <motion.circle
              key={`pulse-${connection.from}-${connection.to}`}
              r="0.6"
              fill="var(--accent-cyan)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                cx: [fromPoint.x, toPoint.x],
                cy: [fromPoint.y, toPoint.y],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}
    </svg>
  );
}
