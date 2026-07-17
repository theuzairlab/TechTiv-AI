export const AUTH_ROUTES = {
  login: "/login",
  redirect: "/auth/redirect",
  userDashboard: "/dashboard",
  adminDashboard: "/admin",
  /** Post-login hub — resolves role and sends users to the right dashboard */
  defaultCallback: "/auth/redirect",
} as const;

export const USER_ROUTE_PREFIXES = ["/dashboard"] as const;
export const ADMIN_ROUTE_PREFIXES = ["/admin"] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ...USER_ROUTE_PREFIXES,
  ...ADMIN_ROUTE_PREFIXES,
] as const;

export const AUTH_PAGE_PREFIXES = ["/login"] as const;

/** Allowed post-login redirect targets (prevents open redirects) */
export function isSafeCallbackUrl(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path === AUTH_ROUTES.redirect
  );
}
