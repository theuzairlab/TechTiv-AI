export const USER_ROLE = "user" as const;
export const ADMIN_ROLE = "admin" as const;

export type AppRole = typeof USER_ROLE | typeof ADMIN_ROLE;

export function getUserRole(role: string | null | undefined): AppRole {
  return role === ADMIN_ROLE ? ADMIN_ROLE : USER_ROLE;
}

export function isAdmin(role: string | null | undefined): boolean {
  return getUserRole(role) === ADMIN_ROLE;
}

export function getHomeRouteForRole(role: string | null | undefined): string {
  return isAdmin(role) ? "/admin" : "/dashboard";
}
