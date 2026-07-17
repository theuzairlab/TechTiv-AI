"use client";

import { motion } from "framer-motion";
import type { DashboardModuleId } from "@/lib/dashboard-demo";
import {
  callAnalytics,
  conversationPreviews,
  leadActivity,
  supportMetrics,
  workflowLogs,
} from "@/lib/dashboard-demo";
import { cn } from "@/lib/utils";

type DashboardModulePanelProps = {
  moduleId: DashboardModuleId;
};

export function DashboardModulePanel({ moduleId }: DashboardModulePanelProps) {
  switch (moduleId) {
    case "leads":
      return (
        <div className="space-y-2">
          {leadActivity.map((lead, index) => (
            <motion.div
              key={lead.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between rounded-lg border border-glass-border bg-bg-secondary/40 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                <p className="text-[10px] text-text-muted">{lead.source}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-semibold text-accent-cyan">
                  {lead.score}
                </p>
                <p
                  className={cn(
                    "text-[10px] font-medium",
                    lead.status === "Hot"
                      ? "text-accent-rose"
                      : lead.status === "Warm"
                        ? "text-brand"
                        : "text-text-muted",
                  )}
                >
                  {lead.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      );

    case "conversations":
      return (
        <div className="space-y-2">
          {conversationPreviews.map((convo, index) => (
            <motion.div
              key={convo.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg border border-glass-border bg-bg-secondary/40 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{convo.user}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    convo.status === "active"
                      ? "bg-brand-cyan/15 text-brand"
                      : "bg-accent-cyan/15 text-accent-cyan",
                  )}
                >
                  {convo.status}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-text-muted">{convo.preview}</p>
            </motion.div>
          ))}
        </div>
      );

    case "support":
      return (
        <div className="grid grid-cols-2 gap-2">
          {supportMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg border border-glass-border bg-bg-secondary/40 p-3 text-center"
            >
              <p className="font-display text-lg font-semibold text-accent-cyan">
                {metric.value}
                {metric.unit}
              </p>
              <p className="text-[10px] text-text-muted">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      );

    case "workflows":
      return (
        <div className="space-y-2">
          {workflowLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between rounded-lg border border-glass-border bg-bg-secondary/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    log.status === "running"
                      ? "animate-pulse bg-ui-dot"
                      : "bg-accent-cyan",
                  )}
                />
                <p className="text-xs text-text-primary">{log.name}</p>
              </div>
              <span className="text-[10px] text-text-muted">{log.duration}</span>
            </motion.div>
          ))}
        </div>
      );

    case "calls":
      return (
        <div className="grid grid-cols-2 gap-2">
          {callAnalytics.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg border border-glass-border bg-bg-secondary/40 p-3 text-center"
            >
              <p className="font-display text-lg font-semibold text-accent-violet">
                {stat.value}
              </p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      );

    default:
      return null;
  }
}
