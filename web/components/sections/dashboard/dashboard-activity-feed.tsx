"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  activityPool,
  activityTypeColors,
  formatActivityTime,
  type ActivityItem,
} from "@/lib/dashboard-demo";
import { initialDashboardActivities } from "@/lib/dashboard-activity";

const MAX_VISIBLE = 6;

export function DashboardActivityFeed() {
  const [activities, setActivities] =
    useState<ActivityItem[]>(initialDashboardActivities);
  const poolIndexRef = useRef(4);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = activityPool[poolIndexRef.current % activityPool.length];
      poolIndexRef.current += 1;

      const newItem: ActivityItem = {
        ...template,
        id: `live-${poolIndexRef.current}`,
        time: formatActivityTime(new Date()),
      };

      setActivities((prev) => [newItem, ...prev].slice(0, MAX_VISIBLE));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">Live Activity</p>
        <span className="flex items-center gap-1.5 text-[10px] text-brand">
          <span className="ui-dot h-1.5 w-1.5 animate-pulse rounded-full" />
          Streaming
        </span>
      </div>

      <div className="max-h-48 space-y-2 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {activities.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-2.5 rounded-lg border border-glass-border bg-bg-secondary/40 px-3 py-2"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityTypeColors[item.type]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-text-primary">{item.message}</p>
                <p className="text-[10px] text-text-muted" suppressHydrationWarning>
                  {item.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
