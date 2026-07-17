import type { AnalysisStatus } from "../generated/prisma/client.js";

export type PipelineContext = {
  analysisId: string;
  runId: string;
  domain: string;
  businessIntake?: unknown;
  socialLinks?: unknown;
};

export type PipelineStep = {
  name: string;
  status: AnalysisStatus;
  source: string;
  run: (ctx: PipelineContext) => Promise<void>;
};

export const STUB_DELAY_MS = Number(process.env.PIPELINE_STUB_DELAY_MS ?? 500);

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
