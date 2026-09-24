import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { countUnreadMessages } from "@/lib/conversations";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();
  const [newLeadsCount, inboxUnreadCount] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }).catch(() => 0),
    countUnreadMessages({
      userId: session.user.id,
      role: session.user.role,
      scope: "inbox",
    }).catch(() => 0),
  ]);

  return (
    <AdminShell
      session={session}
      newLeadsCount={newLeadsCount}
      inboxUnreadCount={inboxUnreadCount}
    >
      {children}
    </AdminShell>
  );
}
