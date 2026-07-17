/** Rolling window for free-tier analysis limit (days). */
export const FREE_ANALYSIS_WINDOW_DAYS = 60;

/** Max free analyses per email within the rolling window. */
export const FREE_ANALYSIS_LIMIT = 1;

/** Reuse completed domain analysis within this window (days). */
export const DOMAIN_FRESHNESS_DAYS = 90;

/** BullMQ queue name — must match backend worker. */
export const ANALYSIS_QUEUE_NAME = "analysis-jobs";
