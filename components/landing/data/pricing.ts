import { IPricing } from "@/components/landing/types";

export const tiers: IPricing[] = [
  {
    name: "Free",
    price: 0,
    features: [
      "Unlimited debate rooms",
      "Agenda and timing controls",
      "Speaker queue management",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: 29,
    features: [
      "Advanced moderation tools",
      "Custom debate templates",
      "Session analytics",
      "Priority support",
      "Team collaboration",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Dedicated success manager",
      "Custom onboarding",
      "Advanced security controls",
      "SLA-backed support",
      "Organization-wide templates",
    ],
  },
];
