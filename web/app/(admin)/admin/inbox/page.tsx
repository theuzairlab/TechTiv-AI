import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { ConversationInbox } from "@/components/inbox/conversation-inbox";
import { requireAdminSession } from "@/lib/session";
import { listConversations } from "@/lib/conversations";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default async function AdminInboxPage() {
  const session = await requireAdminSession();
  const conversations = await listConversations({
    userId: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        label="CRM"
        title="Inbox"
        description="Two-way conversations with clients. Threads are shared with the client portal."
      />
      <Suspense fallback={<p className="text-sm text-text-muted">Loading inbox…</p>}>
        <ConversationInbox
          initialConversations={conversations}
          viewerUserId={session.user.id}
          emptyLabel="No conversations yet. Open a client 360 and choose Message client."
          inboxScope="inbox"
        />
      </Suspense>
    </div>
  );
}
