import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Consultant chats",
  robots: { index: false, follow: false },
};

export default async function AdminConsultantSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  const query = session ? `&session=${encodeURIComponent(session)}` : "";
  redirect(`/admin/conversations?type=consultant${query}`);
}
