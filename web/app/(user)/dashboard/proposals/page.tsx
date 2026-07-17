import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { listAnalysesForUser } from "@/lib/dashboard/analyses";
import { requireUserSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata: Metadata = {
  title: "Proposals",
  robots: { index: false, follow: false },
};

export default async function UserProposalsPage() {
  const session = await requireUserSession();
  const analyses = await listAnalysesForUser(
    session.user.id,
    session.user.email,
  );
  const proposals = analyses.filter((item) => item.proposalStatus != null);

  return (
    <div className="space-y-6">
      <div>
        <p className="s-label">— Proposals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          Proposals
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Generated proposals with downloadable PDF blueprints.
        </p>
      </div>

      {proposals.length === 0 ? (
        <GlassPanel className="p-6">
          <p className="text-sm text-text-muted">
            No proposals yet.{" "}
            <Link href="/analyze" className="text-brand-cyan hover:text-brand">
              Start an analysis
            </Link>{" "}
            to generate one.
          </p>
        </GlassPanel>
      ) : (
        <ul className="space-y-3">
          {proposals.map((item) => (
            <li key={item.id}>
              <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Status: {item.proposalStatus}
                    {item.costEstimateUSD != null
                      ? ` · $${item.costEstimateUSD.toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">{item.status}</Badge>
                  {item.status === "DONE" ? (
                    <Button
                      href={`/api/analysis/${item.id}/pdf`}
                      size="sm"
                      variant="secondary"
                    >
                      <Download size={14} className="mr-1.5" />
                      PDF
                    </Button>
                  ) : null}
                  <Button
                    href={`/dashboard/analyses/${item.id}`}
                    size="sm"
                  >
                    View
                  </Button>
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
