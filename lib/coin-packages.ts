export type CoinPackage = {
  id: string;
  coins: number;
  amountCents: number;
  priceLabel: string;
  badge: string;
};

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "starter", coins: 100, amountCents: 99, priceLabel: "$0.99", badge: "" },
  { id: "popular", coins: 500, amountCents: 399, priceLabel: "$3.99", badge: "Popular" },
  { id: "value", coins: 1200, amountCents: 799, priceLabel: "$7.99", badge: "Best Value" },
  { id: "creator", coins: 2500, amountCents: 1499, priceLabel: "$14.99", badge: "" },
];

export function getCoinPackage(packageId: string | null | undefined) {
  if (!packageId) {
    return null;
  }

  return COIN_PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}
