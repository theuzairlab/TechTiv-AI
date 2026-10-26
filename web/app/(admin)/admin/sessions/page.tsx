import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Intake chats",
  robots: { index: false, follow: false },
};

export default function AdminSessionsPage() {
  redirect("/admin/conversations?type=intake");
}
