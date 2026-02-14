import { ITestimonial } from "@/components/landing/types";
import { REVIEWS } from "@/linkify/utils/constants/misc";

export const testimonials: ITestimonial[] = REVIEWS.slice(0, 3).map(
  (review) => ({
    name: review.name,
    role: review.username,
    message: review.review,
    avatar: review.avatar,
  })
);
