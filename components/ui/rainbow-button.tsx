"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
};

const sizeClasses = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-base",
  icon: "h-10 w-10",
};

export function RainbowButton({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center rounded-xl p-[2px] transition hover:scale-[1.01]",
        "bg-[conic-gradient(from_90deg,rgba(16,26,37,0.2),rgba(255,90,0,0.7),rgba(255,216,0,0.7),rgba(0,214,255,0.7),rgba(120,0,255,0.7),rgba(16,26,37,0.2))]",
        "animate-[spin_6s_linear_infinite]",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-[inherit] font-semibold",
          variant === "outline"
            ? "border border-black/10 bg-white text-black"
            : "bg-[#101A25] text-white shadow-[0_12px_24px_rgba(16,26,37,0.25)]",
          sizeClasses[size]
        )}
      >
        {children}
      </span>
    </button>
  );
}
