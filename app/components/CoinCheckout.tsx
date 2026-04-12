"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COIN_PACKAGES } from "@/lib/coin-packages";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default function CoinCheckout() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId")?.trim() ?? "";
  const selectedPackageId = searchParams.get("package");
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const packages = useMemo(() => {
    if (!selectedPackageId) {
      return COIN_PACKAGES;
    }

    const selected = COIN_PACKAGES.find((pkg) => pkg.id === selectedPackageId);
    if (!selected) {
      return COIN_PACKAGES;
    }

    return [selected, ...COIN_PACKAGES.filter((pkg) => pkg.id !== selectedPackageId)];
  }, [selectedPackageId]);

  async function handleCheckout(packageId: string) {
    if (!isUuid(userId)) {
      setError("Missing or invalid mobile user id. Open this page from the app.");
      return;
    }

    setLoadingPackageId(packageId);
    setError(null);

    try {
      const response = await fetch("/api/coins/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, userId }),
      });

      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to start checkout.");
      }

      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout.",
      );
      setLoadingPackageId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-white">
      <div className="rounded-[32px] border border-white/10 bg-[#111114] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#f7a640]">
            Podium Coins
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-aeonik)] text-4xl font-semibold text-white sm:text-5xl">
            Buy coins, send gifts, boost the room.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/70">
            Coins are used inside the mobile app to send roses, rockets, crowns,
            and more during live debates. Checkout is handled by Stripe and your
            balance is credited after payment confirms.
          </p>
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Buying for user:{" "}
            <span className="font-mono text-white/90">
              {userId || "missing mobile user id"}
            </span>
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffd2d2]">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => void handleCheckout(pkg.id)}
              disabled={loadingPackageId !== null}
              className="group flex min-h-[240px] flex-col rounded-[28px] border border-white/10 bg-[#18181d] p-6 text-left transition hover:border-[#f7a640]/70 hover:bg-[#1c1c22] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                    Coin Pack
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    {pkg.coins.toLocaleString()}
                  </h2>
                </div>
                {pkg.badge ? (
                  <span className="rounded-full bg-[#f7a640] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#17120a]">
                    {pkg.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-6 text-white/65">
                Top up your Podium balance to keep gifting during live debates
                without leaving the moment.
              </p>

              <div className="mt-auto pt-8">
                <div className="text-3xl font-semibold text-white">{pkg.priceLabel}</div>
                <div className="mt-2 text-sm text-white/45">
                  {loadingPackageId === pkg.id ? "Opening Stripe checkout..." : "Checkout with Stripe"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
