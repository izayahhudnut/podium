"use client";

import { useState, useTransition } from "react";
import { Input } from "@/linkify/components/ui/input";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { cn } from "@/linkify/utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistFormProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function WaitlistForm({
  variant = "light",
  className,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setMessage(payload?.error ?? "Something went wrong. Try again.");
          return;
        }

        setEmail("");
        setMessage("You’re on the list. We’ll be in touch.");
      } catch {
        setMessage("Something went wrong. Try again.");
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={cn(
          "h-12 w-full rounded-full px-5 sm:w-[320px]",
          variant === "dark"
            ? "bg-white text-black placeholder:text-black/70 border-black/20 focus-visible:ring-white/40"
            : "bg-white text-black placeholder:text-black/60 border-gray-300 focus-visible:ring-primary/40"
        )}
      />
      <RainbowButton
        type="submit"
        size="lg"
        disabled={isPending}
        className={cn(
          "animate-none rounded-full w-full sm:w-auto sm:min-w-[140px] justify-center",
          isPending && "opacity-70 pointer-events-none"
        )}
      >
        {isPending ? "Adding..." : "Join waitlist"}
      </RainbowButton>
      {message ? (
        <span
          className={cn(
            "text-xs sm:ml-2",
            variant === "dark" ? "text-white/70" : "text-foreground-accent"
          )}
        >
          {message}
        </span>
      ) : null}
    </form>
  );
}
