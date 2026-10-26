import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyGuestAccess } from "@/lib/analysis/guest";
import { arePaymentsEnabled } from "@/lib/billing/settings";
import { hasRealBillingEmail } from "@/lib/billing/gate";
import { appBaseUrl, blueprintPriceId, getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  analysisId: z.string().min(1),
  guestAccessToken: z.string().uuid().optional(),
  returnPath: z.string().optional(),
});

function safeReturnPath(value: string | undefined): string {
  if (
    value === "/dashboard/analyze" ||
    value === "/analyze" ||
    value === "/dashboard/billing"
  ) {
    return value;
  }
  return "/analyze";
}

export async function POST(request: Request) {
  try {
    if (!(await arePaymentsEnabled())) {
      return NextResponse.json(
        { error: "Payments are off" },
        { status: 409 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
    }

    const stripe = getStripe();
    const price = blueprintPriceId();
    if (!stripe || !price) {
      return NextResponse.json(
        { error: "Stripe is not configured yet" },
        { status: 503 },
      );
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: parsed.data.analysisId },
      select: {
        id: true,
        guestAccessToken: true,
        leadId: true,
        lead: { select: { email: true, userId: true } },
      },
    });
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    const userSession = await getSession();
    const accountEmail = userSession?.user.email?.trim().toLowerCase() ?? "";
    const leadEmail = analysis.lead.email.trim().toLowerCase();
    const ownsAccount =
      Boolean(accountEmail) &&
      (leadEmail === accountEmail || analysis.lead.userId === userSession?.user.id);
    const guestOk = verifyGuestAccess(
      analysis.guestAccessToken,
      parsed.data.guestAccessToken,
    );
    if (!ownsAccount && !guestOk) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const email = leadEmail;
    if (!hasRealBillingEmail(email)) {
      return NextResponse.json(
        { error: "Add an email before paying" },
        { status: 422 },
      );
    }

    const payment = await prisma.payment.create({
      data: {
        email,
        leadId: analysis.leadId,
        analysisId: analysis.id,
        status: "PENDING",
        currency: "usd",
      },
    });

    const base = appBaseUrl();
    const returnPath = safeReturnPath(parsed.data.returnPath);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}${returnPath}?payment=success&analysisId=${analysis.id}`,
      cancel_url: `${base}${returnPath}?payment=cancel&analysisId=${analysis.id}`,
      metadata: {
        paymentId: payment.id,
        analysisId: analysis.id,
        email,
        returnPath,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout link" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[api/payments/checkout]", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
