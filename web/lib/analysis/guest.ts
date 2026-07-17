import { randomUUID } from "node:crypto";

export const GUEST_EMAIL_DOMAIN = "guest.techtivai.local";

export function isPendingGuestEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${GUEST_EMAIL_DOMAIN}`);
}

export function createGuestAccessToken(): string {
  return randomUUID();
}

export function createPendingGuestEmail(token: string): string {
  return `pending-${token}@${GUEST_EMAIL_DOMAIN}`;
}

export function verifyGuestAccess(
  guestAccessToken: string | null | undefined,
  provided: string | null | undefined,
): boolean {
  if (!guestAccessToken || !provided) return false;
  return guestAccessToken === provided;
}
