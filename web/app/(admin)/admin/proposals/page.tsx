import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/pages/admin/admin-placeholder-page";

export const metadata: Metadata = {
  title: "Proposals",
  robots: { index: false, follow: false },
};

export default function AdminProposalsPage() {
  return (
    <AdminPlaceholderPage
      title="Proposal generation"
      description="Automation proposals, implementation plans, and PDF export status."
    />
  );
}
