import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceivedEmail } from "@/lib/email/send";
import { appBaseUrl, getStripe } from "@/lib/billing/stripe";

export async function rememberStripeEvent(
  event: Stripe.Event,
): Promise<boolean> {
  try {
    await prisma.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });
    return true;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code === "P2002") return false;
    throw error;
  }
}

export async function applyStripeEvent(event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return;
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    const amountCents = session.amount_total ?? 0;
    const email = (session.customer_email ?? session.metadata?.email ?? "")
      .trim()
      .toLowerCase();
    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    const updated = await prisma.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: {
        status: "PAID",
        amountCents,
        email: email || undefined,
        stripeCustomerId: customerId,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
      },
    });

    if (updated.count === 1 && email) {
      const returnPath =
        session.metadata?.returnPath === "/dashboard/analyze" ||
        session.metadata?.returnPath === "/dashboard/billing"
          ? session.metadata.returnPath
          : "/analyze";
      const analysisId = session.metadata?.analysisId;
      try {
        await sendPaymentReceivedEmail({
          to: email,
          continueUrl: `${appBaseUrl()}${returnPath}?payment=success${
            analysisId ? `&analysisId=${analysisId}` : ""
          }`,
        });
      } catch (error) {
        console.error("[billing] payment email failed:", error);
      }
    }
    return;
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;
    await prisma.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : null;
    if (!paymentIntentId) return;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId, status: "PAID" },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
      },
    });
  }
}

export async function handleStripeWebhook(request: Request): Promise<NextResponse> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("[billing] webhook signature rejected:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const fresh = await rememberStripeEvent(event);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await applyStripeEvent(event);
  return NextResponse.json({ received: true });
}
