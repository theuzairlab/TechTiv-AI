"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardActivityFeed } from "@/components/sections/dashboard/dashboard-activity-feed";
import { DashboardModulePanel } from "@/components/sections/dashboard/dashboard-module-panel";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  dashboardModules,
  dashboardStats,
  type DashboardModuleId,
} from "@/lib/dashboard-demo";
import { cn } from "@/lib/utils";

const chartBars = [35, 55, 42, 70, 48, 82, 60, 90, 65, 78, 52, 88];

export function DashboardDemo() {
  const [activeModule, setActiveModule] = useState<DashboardModuleId>("leads");

  const activeLabel =
    dashboardModules.find((m) => m.id === activeModule)?.label ?? "Dashboard";

  return (
    <GlassPanel variant="elevated" className="overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-glass-border bg-bg-secondary/60 px-4 py-3 sm:px-5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-accent-rose/80" />
          <span className="ui-dot h-3 w-3 rounded-full opacity-80" />
          <span className="h-3 w-3 rounded-full bg-accent-cyan/80" />
        </div>
        <p className="text-xs font-medium text-text-muted">
          TechTivAI Command Center
        </p>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-brand">
          <span className="ui-dot h-1.5 w-1.5 animate-pulse rounded-full" />
          Live
        </span>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <nav className="border-b border-glass-border p-3 lg:border-r lg:border-b-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {dashboardModules.map((module) => (
              <li key={module.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActiveModule(module.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors whitespace-nowrap",
                    activeModule === module.id
                      ? "bg-accent-cyan/15 text-accent-cyan"
                      : "text-text-muted hover:bg-bg-secondary/60 hover:text-text-primary",
                  )}
                >
                  <span className="text-sm">{module.icon}</span>
                  {module.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <div className="p-4 sm:p-5">
          {/* Stat cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-glass-border bg-bg-secondary/40 p-3"
              >
                <p className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <p className="text-[10px] text-text-muted sm:text-xs">
                    {stat.label}
                  </p>
                  <span className="text-[10px] font-medium text-brand">
                    {stat.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Chart */}
            <div className="rounded-xl border border-glass-border bg-bg-primary/50 p-4">
              <p className="mb-3 text-xs font-medium text-text-muted">
                AI Performance — Last 12h
              </p>
              <div className="flex h-24 items-end gap-1">
                {chartBars.map((height, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 rounded-t-sm bg-linear-to-t from-accent-violet/20 to-accent-violet"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <DashboardActivityFeed />
          </div>

          {/* Module panel */}
          <div className="mt-4 rounded-xl border border-glass-border bg-bg-primary/50 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <p className="mb-3 text-xs font-medium text-text-muted">
                  {activeLabel}
                </p>
                <DashboardModulePanel moduleId={activeModule} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
