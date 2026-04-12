import { NextResponse } from "next/server";
import { getCoinPackage } from "@/lib/coin-packages";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutBody = {
  packageId?: string;
  userId?: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_WEB_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const coinPackage = getCoinPackage(body.packageId);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  if (!isUuid(userId)) {
    return NextResponse.json({ error: "Invalid userId." }, { status: 400 });
  }

  if (!coinPackage) {
    return NextResponse.json({ error: "Invalid coin package." }, { status: 400 });
  }

  const baseUrl = getBaseUrl(request);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/coins/success?userId=${encodeURIComponent(userId)}`,
    cancel_url: `${baseUrl}/coins?userId=${encodeURIComponent(userId)}&package=${encodeURIComponent(coinPackage.id)}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: coinPackage.amountCents,
          product_data: {
            name: `${coinPackage.coins.toLocaleString()} Podium Coins`,
            description: "Use coins to send gifts during live debates on Podium.",
          },
        },
      },
    ],
    metadata: {
      package_id: coinPackage.id,
      coin_amount: String(coinPackage.coins),
      user_id: userId,
    },
    payment_intent_data: {
      metadata: {
        package_id: coinPackage.id,
        coin_amount: String(coinPackage.coins),
        user_id: userId,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
