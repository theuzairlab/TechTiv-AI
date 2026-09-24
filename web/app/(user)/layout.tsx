import { UserShell } from "@/components/dashboard/user-shell";
import { requireUserSession } from "@/lib/session";
import { countUnreadMessages } from "@/lib/conversations";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireUserSession();
  const inboxUnreadCount = await countUnreadMessages({
    userId: session.user.id,
    scope: "own",
  }).catch(() => 0);

  return (
    <UserShell session={session} inboxUnreadCount={inboxUnreadCount}>
      {children}
    </UserShell>
  );
}
