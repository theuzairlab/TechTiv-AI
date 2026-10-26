import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/billing/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return await handleStripeWebhook(request);
  } catch (error) {
    console.error("[api/payments/webhook]", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
