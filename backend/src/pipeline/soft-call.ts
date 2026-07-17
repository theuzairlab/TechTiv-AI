import type { PipelineContext } from "./types.js";
import { logAnalysisActivity } from "./activity.js";
import { writeRawSignal } from "./update-status.js";

export async function softProviderCall<T>(
  ctx: PipelineContext,
  source: string,
  fn: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeRawSignal(ctx.analysisId, source, {
      failed: true,
      error: message.slice(0, 500),
      domain: ctx.domain,
    });
    await logAnalysisActivity({
      analysisId: ctx.analysisId,
      kind: "warning",
      message: `${source} unavailable — continuing with remaining intelligence signals.`,
      metadata: { source, error: message.slice(0, 200) },
    });
    return { ok: false, error: message };
  }
}
