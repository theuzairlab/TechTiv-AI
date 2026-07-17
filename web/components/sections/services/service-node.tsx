"use client";

import { motion } from "framer-motion";
import type { Service } from "@/lib/services";
import {
  accentStyles,
  getAccentClasses,
} from "@/components/sections/services/service-styles";
import { cn } from "@/lib/utils";

type ServiceNodeProps = {
  service: Service;
  active: boolean;
  connected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
};

export function ServiceNode({
  service,
  active,
  connected,
  onSelect,
  compact = false,
}: ServiceNodeProps) {
  const accent = accentStyles[service.accent];

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        className={cn(
          "w-full rounded-2xl border p-4 text-left",
          getAccentClasses(service.accent, active),
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1",
              accent.bg,
              accent.text,
              accent.ring,
            )}
          >
            {service.isHub ? "◈" : "◇"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {service.label}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-text-muted">
              {service.shortDescription}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(service.id)}
      className={cn(
        "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border text-left",
        service.isHub ? "w-44 p-4 sm:w-48" : "w-36 p-3 sm:w-40",
        getAccentClasses(service.accent, active),
        connected && !active && "border-accent-cyan/20",
      )}
      style={{
        left: `${service.position.x}%`,
        top: `${service.position.y}%`,
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: active ? 1.06 : 1,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg font-bold ring-1",
            service.isHub ? "h-8 w-8 text-sm" : "h-7 w-7 text-xs",
            accent.bg,
            accent.text,
            accent.ring,
          )}
        >
          {service.isHub ? "◈" : "◇"}
        </span>
        <span
          className={cn(
            "font-medium leading-tight text-text-primary",
            service.isHub ? "text-sm" : "text-xs",
          )}
        >
          {service.label}
        </span>
      </div>

      {active ? (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 block text-[10px] leading-snug text-text-muted sm:text-xs"
        >
          {service.shortDescription}
        </motion.span>
      ) : null}

      {connected && !active ? (
        <span
          className={cn(
            "absolute -right-1 -top-1 h-2 w-2 rounded-full",
            accent.dot,
          )}
        />
      ) : null}
    </motion.button>
  );
}
