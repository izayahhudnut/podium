import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getCoinPackage } from "@/lib/coin-packages";
import { fulfillCoinPurchase } from "@/lib/coins";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid Stripe signature",
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const packageId = session.metadata?.package_id ?? null;
    const userId = session.metadata?.user_id ?? null;
    const coinPackage = getCoinPackage(packageId);

    if (session.payment_status === "paid" && userId && coinPackage) {
      await fulfillCoinPurchase({
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
    }
  }

  return NextResponse.json({ received: true });
}
