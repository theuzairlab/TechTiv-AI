import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Voice calls",
  robots: { index: false, follow: false },
};

export default function AdminVoicePage() {
  redirect("/admin/conversations?type=voice");
}
