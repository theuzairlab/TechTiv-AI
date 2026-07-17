import type { Metadata } from "next";
import { AdminPlaceholderPage } from "@/components/pages/admin/admin-placeholder-page";

export const metadata: Metadata = {
  title: "AI Sessions",
  robots: { index: false, follow: false },
};

export default function AdminSessionsPage() {
  return (
    <AdminPlaceholderPage
      title="AI conversation logs"
      description="Chat, discovery, and voice consultation sessions across the platform."
    />
  );
}
