import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function blueprintPriceId(): string | null {
  const price = process.env.STRIPE_BLUEPRINT_PRICE_ID?.trim();
  return price || null;
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
