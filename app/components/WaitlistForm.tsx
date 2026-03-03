"use client";

import { useRouter } from "next/navigation";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { cn } from "@/linkify/utils";

type WaitlistFormProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function WaitlistForm({
  variant = "light",
  className,
}: WaitlistFormProps) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <RainbowButton
        size="lg"
        type="button"
        onClick={() => router.push("/waitlist")}
        className={cn(
          "animate-none rounded-full w-full sm:w-auto sm:min-w-[160px] justify-center"
        )}
      >
        Join waitlist
      </RainbowButton>
    </div>
  );
}
