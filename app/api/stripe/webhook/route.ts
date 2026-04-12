import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getCoinPackage } from "@/lib/coin-packages";
import { fulfillCoinPurchase } from "@/lib/coins";
import { trackLog, withTrace } from "@/lib/opscompanion";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return withTrace("payments.webhook.handle", { feature: "payments", route: "/api/stripe/webhook" }, async () => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      await trackLog({
        eventName: "payments.webhook.missing_secret",
        severity: "ERROR",
        attributes: { feature: "payments", route: "/api/stripe/webhook" },
      });
      return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
    }

    const signature = (await headers()).get("stripe-signature");
    if (!signature) {
      await trackLog({
        eventName: "payments.webhook.missing_signature",
        severity: "WARN",
        attributes: { feature: "payments", route: "/api/stripe/webhook" },
      });
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripe();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      await trackLog({
        eventName: "payments.webhook.invalid_signature",
        severity: "ERROR",
        body: error instanceof Error ? error.message : "Invalid Stripe signature",
        attributes: { feature: "payments", route: "/api/stripe/webhook" },
      });
      return new Response(
        error instanceof Error ? error.message : "Invalid Stripe signature",
        { status: 400 },
      );
    }

    await trackLog({
      eventName: "payments.webhook.received",
      body: { eventId: event.id, eventType: event.type },
      attributes: { feature: "payments", route: "/api/stripe/webhook" },
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const packageId = session.metadata?.package_id ?? null;
      const userId = session.metadata?.user_id ?? null;
      const coinPackage = getCoinPackage(packageId);

      if (session.payment_status === "paid" && userId && coinPackage) {
        const credited = await fulfillCoinPurchase({
          userId,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          packageId: coinPackage.id,
          coinAmount: coinPackage.coins,
          amountCents: coinPackage.amountCents,
          currency: session.currency ?? "usd",
          customerEmail: session.customer_details?.email ?? null,
        });

        await trackLog({
          eventName: credited
            ? "payments.webhook.coin_fulfilled"
            : "payments.webhook.coin_fulfillment_duplicate",
          body: {
            eventId: event.id,
            sessionId: session.id,
            userId,
            packageId: coinPackage.id,
            coins: coinPackage.coins,
          },
          attributes: {
            feature: "payments",
            route: "/api/stripe/webhook",
            "user.id": userId,
            "package.id": coinPackage.id,
          },
        });
      } else {
        await trackLog({
          eventName: "payments.webhook.checkout_ignored",
          severity: "WARN",
          body: {
            eventId: event.id,
            paymentStatus: session.payment_status,
            userId,
            packageId,
          },
          attributes: { feature: "payments", route: "/api/stripe/webhook" },
        });
      }
    }

    return NextResponse.json({ received: true });
  });
}
