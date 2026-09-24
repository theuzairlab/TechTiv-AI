import type { Metadata } from "next";
import Link from "next/link";
import { listAnalysesForUser } from "@/lib/dashboard/analyses";
import { requireUserSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ConsultantWorkspace } from "@/components/consultant/consultant-workspace";

export const metadata: Metadata = {
  title: "AI Consultant",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ analysisId?: string }>;
};

export default async function ConsultantPage({ searchParams }: PageProps) {
  const session = await requireUserSession();
  const params = await searchParams;
  const analyses = await listAnalysesForUser(
    session.user.id,
    session.user.email,
  );
  const done = analyses
    .filter((item) => item.status === "DONE")
    .map((item) => ({
      id: item.id,
      domain: item.domain,
      aiScore: item.aiScore,
      opportunityCount: item.opportunityCount,
      topFinding: item.topFinding,
    }));
  const selected =
    done.find((item) => item.id === params.analysisId) ?? done[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <p className="s-label">— Consultant</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          AI Consultant
        </h1>
        <p className="text-text-muted">
          Talk with TivAI about your blueprint. Use chat, or start a voice call
          from the button on the right.
        </p>
        {!process.env.GEMINI_API_KEY?.trim() ? (
          <p className="text-sm text-destructive">
            Add GEMINI_API_KEY to web/.env, then enable the gemini provider in
            Admin → Providers.
          </p>
        ) : null}
      </div>

      {selected ? (
        <ConsultantWorkspace analysisId={selected.id} blueprints={done} />
      ) : (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-text-muted">
            Complete an analysis first so the consultant can load your blueprint.
          </p>
          <Button href="/dashboard/analyze" className="mt-5" size="sm">
            Start analysis
          </Button>
          <p className="mt-4 text-sm text-text-muted">
            No completed blueprints yet.{" "}
            <Link href="/dashboard/analyze" className="text-brand-cyan hover:text-brand">
              Start an analysis
            </Link>
            .
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
