import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { countUnreadMessages } from "@/lib/conversations";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopeParam = new URL(request.url).searchParams.get("scope");
  const scope =
    scopeParam === "own" || scopeParam === "inbox" ? scopeParam : undefined;

  const unreadCount = await countUnreadMessages({
    userId: session.user.id,
    role: session.user.role,
    scope,
  });

  return NextResponse.json({ unreadCount });
}
