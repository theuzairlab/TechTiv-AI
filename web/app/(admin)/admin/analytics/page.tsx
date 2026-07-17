import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/pages/admin/admin-placeholder-page";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      title="Platform analytics"
      description="Conversion metrics, workflow monitoring, and automation performance."
    />
  );
}
