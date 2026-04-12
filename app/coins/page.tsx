import { Suspense } from "react";
import CoinWallet from "@/app/components/CoinWallet";

export default function CoinsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1f25,_#09090b_58%)]">
      <Suspense fallback={null}>
        <CoinWallet />
      </Suspense>
    </main>
  );
}
