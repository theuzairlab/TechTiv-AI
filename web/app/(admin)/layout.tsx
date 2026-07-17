import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();
  const newLeadsCount = await prisma.lead
    .count({ where: { status: "NEW" } })
    .catch(() => 0);

  return (
    <AdminShell session={session} newLeadsCount={newLeadsCount}>
      {children}
    </AdminShell>
  );
}
