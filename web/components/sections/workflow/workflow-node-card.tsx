"use client";

import { motion } from "framer-motion";
import type { WorkflowNode } from "@/lib/workflow";
import { nodeTypeStyles } from "@/lib/workflow";
import { cn } from "@/lib/utils";

type WorkflowNodeCardProps = {
  node: WorkflowNode;
  active: boolean;
  executed: boolean;
  isRunning: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

export function WorkflowNodeCard({
  node,
  active,
  executed,
  isRunning,
  onPointerEnter,
  onPointerLeave,
}: WorkflowNodeCardProps) {
  const styles = nodeTypeStyles[node.type];

  return (
    <div
      className="w-36 sm:w-40"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        className={cn(
          "cursor-grab rounded-xl border bg-glass-bg/95 p-3 backdrop-blur-md active:cursor-grabbing",
          styles.border,
          active && cn("ring-2 ring-accent-cyan/50", styles.glow),
          executed && !active && "border-accent-cyan/25",
        )}
        animate={{
          scale: active && isRunning ? 1.05 : 1,
          boxShadow:
            active && isRunning
              ? "0 0 24px color-mix(in srgb, var(--accent-cyan) 35%, transparent)"
              : "0 0 0px transparent",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-base">{node.icon}</span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide",
              styles.badge,
            )}
          >
            {node.type}
          </span>
        </div>
        <p className="text-xs font-semibold leading-snug text-text-primary sm:text-sm">
          {node.label}
        </p>
        {active ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-1.5 text-[10px] leading-snug text-text-muted"
          >
            {node.description}
          </motion.p>
        ) : null}

        {executed && isRunning ? (
          <motion.div
            className="mt-2 flex items-center gap-1.5 text-[10px] text-brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="ui-dot h-1.5 w-1.5 rounded-full" />
            Executed
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
