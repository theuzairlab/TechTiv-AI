import type { ActivityItem } from "@/lib/dashboard-demo";
import { activityPool } from "@/lib/dashboard-demo";

/** SSR-safe initial feed — no Date.now() to avoid hydration mismatch */
export const initialDashboardActivities: ActivityItem[] = activityPool
  .slice(0, 4)
  .map((item, index) => ({
    ...item,
    id: `init-${index}`,
    time: `${(4 - index) * 2}m ago`,
  }));
