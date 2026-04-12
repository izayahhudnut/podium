"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { COIN_PACKAGES } from "@/lib/coin-packages";
import { supabaseBrowser } from "@/lib/supabase-browser";

type WalletBalances = {
  coins: number;
  diamonds: number;
  totalDiamondsEarned: number;
};

type AuthMode = "sign-in" | "sign-up";

const EMPTY_BALANCES: WalletBalances = {
  coins: 0,
  diamonds: 0,
  totalDiamondsEarned: 0,
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function readBalances(userId: string): Promise<WalletBalances> {
  const [coinResult, diamondResult] = await Promise.all([
    supabaseBrowser
      .from("coin_balances")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseBrowser
      .from("diamond_balances")
      .select("balance,total_earned")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (coinResult.error) {
    throw coinResult.error;
  }

  if (diamondResult.error) {
    throw diamondResult.error;
  }

  return {
    coins: coinResult.data?.balance ?? 0,
    diamonds: diamondResult.data?.balance ?? 0,
    totalDiamondsEarned: diamondResult.data?.total_earned ?? 0,
  };
}

export default function CoinWallet() {
  const searchParams = useSearchParams();
  const userIdFromLink = searchParams.get("userId")?.trim() ?? "";
  const selectedPackageId = searchParams.get("package");

  const [user, setUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<WalletBalances>(EMPTY_BALANCES);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [checkoutPackageId, setCheckoutPackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const effectiveUserId = user?.id ?? userIdFromLink;
  const hasValidEffectiveUserId = isUuid(effectiveUserId);

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

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { session },
        error: sessionError,
      } = await supabaseBrowser.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setUser(session?.user ?? null);
      setWalletLoading(false);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setUser(session?.user ?? null);
      setError(null);
      setNotice(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      if (!user) {
        setBalances(EMPTY_BALANCES);
        setWalletLoading(false);
        return;
      }

      setWalletLoading(true);

      try {
        const nextBalances = await readBalances(user.id);
        if (!active) {
          return;
        }

        setBalances(nextBalances);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your wallet.",
        );
      } finally {
        if (active) {
          setWalletLoading(false);
        }
      }
    }

    void loadWallet();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (authMode === "sign-in") {
        const { error: signInError } =
          await supabaseBrowser.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          throw signInError;
        }

        setNotice("Signed in. Your wallet is ready.");
      } else {
        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        setNotice(
          "Account created. If email confirmation is enabled in Supabase, confirm your email before signing in.",
        );
        setAuthMode("sign-in");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to continue.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleCheckout(packageId: string) {
    if (!hasValidEffectiveUserId) {
      setError("Sign in first so we know which wallet to credit.");
      return;
    }

    setCheckoutPackageId(packageId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/coins/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, userId: effectiveUserId }),
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
      setCheckoutPackageId(null);
    }
  }

  async function handleSignOut() {
    setError(null);
    setNotice(null);
    await supabaseBrowser.auth.signOut();
    setBalances(EMPTY_BALANCES);
  }

  function handleMockRedeem() {
    setNotice(
      "Redeem is mocked for now. When you are ready, we can turn this into a payout request flow for hosts.",
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white sm:py-16">
      <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#101014] shadow-[0_40px_140px_rgba(0,0,0,0.4)]">
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(247,166,64,0.24),_transparent_36%),linear-gradient(135deg,_#18151f,_#0e0e11_58%)] px-8 py-10 sm:px-10">
          <p className="text-sm uppercase tracking-[0.28em] text-[#f7a640]">
            Podium Wallet
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-aeonik)] text-4xl font-semibold text-white sm:text-5xl">
            Buy coins. Track gifts. Mock cash-out.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
            Use the same Supabase login as the mobile app. View your coin balance,
            see the diamonds you have earned as a host, buy more coins with Stripe,
            and tap a mocked redeem action until payouts are ready.
          </p>
        </div>

        <div className="grid gap-8 px-8 py-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                  Coins
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {walletLoading ? "--" : balances.coins.toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-white/55">
                  Spend these on roses, rockets, crowns, and other gifts in live rooms.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                  Diamonds
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {walletLoading ? "--" : balances.diamonds.toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-white/55">
                  Hosts earn diamonds when viewers send gifts during lives.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                  Total Earned
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {walletLoading ? "--" : balances.totalDiamondsEarned.toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-white/55">
                  Lifetime diamonds earned so far as a creator.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#15151a] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                    Checkout
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Buy more coins
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    Choose a pack and we will send you to Stripe. After payment clears,
                    your Supabase wallet is credited automatically by the webhook.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMockRedeem}
                  className="rounded-full border border-[#64d7f7]/35 bg-[#64d7f7]/10 px-4 py-2 text-sm font-medium text-[#bcefff] transition hover:border-[#64d7f7]/55 hover:bg-[#64d7f7]/16"
                >
                  Mock Redeem
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => void handleCheckout(pkg.id)}
                    disabled={checkoutPackageId !== null || !user}
                    className="group flex min-h-[220px] flex-col rounded-[26px] border border-white/10 bg-[#1a1a20] p-5 text-left transition hover:border-[#f7a640]/70 hover:bg-[#1d1d24] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.16em] text-white/45">
                          Coin Pack
                        </p>
                        <h3 className="mt-3 text-3xl font-semibold text-white">
                          {pkg.coins.toLocaleString()}
                        </h3>
                      </div>
                      {pkg.badge ? (
                        <span className="rounded-full bg-[#f7a640] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#17120a]">
                          {pkg.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/60">
                      Keep your gifting balance ready so you can send support without
                      leaving the live.
                    </p>

                    <div className="mt-auto pt-8">
                      <div className="text-3xl font-semibold text-white">
                        {pkg.priceLabel}
                      </div>
                      <div className="mt-2 text-sm text-white/45">
                        {!user
                          ? "Sign in to buy"
                          : checkoutPackageId === pkg.id
                            ? "Opening Stripe checkout..."
                            : "Checkout with Stripe"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[#15151a] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                    Account
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {user ? "Wallet connected" : "Sign in with your app account"}
                  </h2>
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>

              {user ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm text-white/85">{user.email}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                      Wallet User ID
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-white/75">
                      {user.id}
                    </p>
                  </div>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleAuthSubmit}>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("sign-in")}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        authMode === "sign-in"
                          ? "bg-white text-[#111114]"
                          : "text-white/60"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("sign-up")}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        authMode === "sign-up"
                          ? "bg-white text-[#111114]"
                          : "text-white/60"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#f7a640]/60"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/70">Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-[#f7a640]/60"
                      placeholder="Your Podium password"
                      autoComplete={
                        authMode === "sign-in" ? "current-password" : "new-password"
                      }
                      minLength={6}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-2xl bg-[#f7a640] px-4 py-3 text-sm font-semibold text-[#17120a] transition hover:bg-[#ffb454] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {authLoading
                      ? "Working..."
                      : authMode === "sign-in"
                        ? "Sign In"
                        : "Create Account"}
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#15151a] p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                How It Works
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
                <p>Viewers buy coins with Stripe on the web.</p>
                <p>Those coins are spent in the mobile app on gifts during lives.</p>
                <p>Hosts earn diamonds from those gifts.</p>
                <p>Redeem is mocked right now, but the diamonds shown here are real balances.</p>
              </div>
            </div>

            {userIdFromLink && user && user.id !== userIdFromLink ? (
              <div className="rounded-[24px] border border-[#f7a640]/30 bg-[#f7a640]/10 px-4 py-3 text-sm text-[#ffd9a7]">
                You opened this link for user <span className="font-mono">{userIdFromLink}</span>,
                but you are signed in as <span className="font-mono">{user.id}</span>. Checkout
                will credit the signed-in account.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[24px] border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffd2d2]">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-[24px] border border-[#64d7f7]/35 bg-[#64d7f7]/10 px-4 py-3 text-sm text-[#c8f5ff]">
                {notice}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
