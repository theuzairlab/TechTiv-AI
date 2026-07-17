/** BullMQ queue name — must match the queue used by web when enqueuing jobs. */
export const ANALYSIS_QUEUE_NAME = "analysis-jobs";

export type AnalysisJobData = {
  analysisId: string;
  kind?: "analysis" | "consultation";
};

export type AnalysisJobResult = {
  analysisId: string;
  status: "completed";
};
