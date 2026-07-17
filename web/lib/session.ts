import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type Session } from "@/lib/auth";
import { AUTH_ROUTES, isSafeCallbackUrl } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";
import { isAdmin, USER_ROLE } from "@/lib/roles";

async function enrichSessionWithRole(
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
): Promise<Session> {
  const existingRole = (session.user as { role?: string }).role;

  if (existingRole) {
    return session as Session;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return {
    ...session,
    user: {
      ...session.user,
      role: dbUser?.role ?? USER_ROLE,
    },
  } as Session;
}

export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    return enrichSessionWithRole(session);
  } catch (error) {
    console.error("[auth] Failed to load session:", error);
    return null;
  }
}

export async function requireSession(loginPath = AUTH_ROUTES.login) {
  const session = await getSession();

  if (!session) {
    redirect(loginPath);
  }

  return session;
}

export async function requireUserSession() {
  return requireSession();
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (!isAdmin((session.user as { role?: string }).role)) {
    redirect(AUTH_ROUTES.userDashboard);
  }

  return session;
}

export async function resolvePostLoginRedirect(callbackUrl?: string | null) {
  const session = await requireSession();

  if (callbackUrl && isSafeCallbackUrl(callbackUrl) && callbackUrl !== AUTH_ROUTES.redirect) {
    return callbackUrl;
  }

  return isAdmin((session.user as { role?: string }).role)
    ? AUTH_ROUTES.adminDashboard
    : AUTH_ROUTES.userDashboard;
}
