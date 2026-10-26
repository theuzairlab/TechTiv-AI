import { UserShell } from "@/components/dashboard/user-shell";
import { listServiceRequestsForUser } from "@/lib/dashboard/analyses";
import { requireUserSession } from "@/lib/session";
import { countUnreadMessages } from "@/lib/conversations";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireUserSession();
  const [inboxUnreadCount, serviceRequests] = await Promise.all([
    countUnreadMessages({
      userId: session.user.id,
      scope: "own",
    }).catch(() => 0),
    listServiceRequestsForUser(session.user.id, session.user.email).catch(() => []),
  ]);

  return (
    <UserShell
      session={session}
      inboxUnreadCount={inboxUnreadCount}
      hasBuildRequests={serviceRequests.length > 0}
    >
      {children}
    </UserShell>
  );
}
