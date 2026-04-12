import "server-only";

import { supabaseRpcRequest } from "./supabase";

type FulfillCoinPurchaseInput = {
  userId: string;
  sessionId: string;
  paymentIntentId: string | null;
  packageId: string;
  coinAmount: number;
  amountCents: number;
  currency: string;
  customerEmail: string | null;
};

export async function fulfillCoinPurchase({
  userId,
  sessionId,
  paymentIntentId,
  packageId,
  coinAmount,
  amountCents,
  currency,
  customerEmail,
}: FulfillCoinPurchaseInput): Promise<boolean> {
  return supabaseRpcRequest<boolean>("fulfill_coin_purchase", {
    p_user_id: userId,
    p_session_id: sessionId,
    p_payment_intent_id: paymentIntentId,
    p_package_id: packageId,
    p_coin_amount: coinAmount,
    p_amount_cents: amountCents,
    p_currency: currency,
    p_customer_email: customerEmail,
  });
}
