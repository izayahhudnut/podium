import { IMenuItem, ISocials } from "@/components/landing/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
  subheading:
    "Podium gives hosts a control room for timing, topics, and stage management.",
  quickLinks: [
    {
      text: "Features",
      url: "#features",
    },
    {
      text: "Pricing",
      url: "#pricing",
    },
    {
      text: "Testimonials",
      url: "#testimonials",
    },
    {
      text: "Waitlist",
      url: "#cta",
    },
  ],
  email: "support@podiumlive.io",
  telephone: "",
  socials: {},
};
