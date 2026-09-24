import type { Metadata } from "next";
import { Suspense } from "react";
import { ConversationInbox } from "@/components/inbox/conversation-inbox";
import { requireUserSession } from "@/lib/session";
import { listConversations } from "@/lib/conversations";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function UserMessagesPage() {
  const session = await requireUserSession();
  const conversations = await listConversations({
    userId: session.user.id,
    scope: "own",
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="s-label">— Messages</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          Messages
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Direct messages with the TechTivAI team.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-text-muted">Loading messages…</p>}>
        <ConversationInbox
          initialConversations={conversations}
          viewerUserId={session.user.id}
          emptyLabel="No messages yet. Send the first note to TechTivAI."
          allowComposeNew
          inboxScope="own"
        />
      </Suspense>
    </div>
  );
}
