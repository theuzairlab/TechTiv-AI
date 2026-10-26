import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Blueprints",
  robots: { index: false, follow: false },
};

export default function AdminBlueprintsPage() {
  redirect("/admin/analyses?status=DONE");
}
