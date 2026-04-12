import Link from "next/link";

export default function CoinCheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1f1f25,_#09090b_58%)] px-6 text-white">
      <div className="max-w-xl rounded-[32px] border border-white/10 bg-[#111114] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <p className="text-sm uppercase tracking-[0.28em] text-[#6ee7b7]">
          Payment Received
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Your coins are on the way.</h1>
        <p className="mt-4 text-base leading-7 text-white/70">
          Stripe sent the payment through. As soon as the webhook confirms it,
          your Podium coin balance will update in the app.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="podiumlive://coins?status=success"
            className="rounded-full bg-[#f7a640] px-6 py-3 font-medium text-[#17120a]"
          >
            Return To App
          </a>
          <Link
            href="/coins"
            className="rounded-full border border-white/15 px-6 py-3 font-medium text-white"
          >
            Buy Another Pack
          </Link>
        </div>
      </div>
    </main>
  );
}
