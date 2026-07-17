import { Suspense } from "react";
import { AdminAnalysesManager } from "@/components/pages/admin/admin-analyses-manager";
import { listAdminAnalyses } from "@/lib/admin/analyses";

export async function AdminAnalysesPageView() {
  const analyses = await listAdminAnalyses({ limit: 200 });

  return (
    <Suspense
      fallback={<div className="text-sm text-text-muted">Loading analyses…</div>}
    >
      <AdminAnalysesManager initialAnalyses={analyses} />
    </Suspense>
  );
}
