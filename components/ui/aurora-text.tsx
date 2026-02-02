"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type AuroraTextProps = {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
};

export function AuroraText({
  children,
  className,
  colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
  speed = 1,
}: AuroraTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(",")})`;
  return (
    <span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        className
      )}
      style={
        {
          backgroundImage: gradient,
          backgroundSize: "200% 200%",
          animation: `aurora-text-shift ${6 / Math.max(speed, 0.2)}s ease-in-out infinite`,
        } as React.CSSProperties
      }
    >
      {children}
      <style>{`
        @keyframes aurora-text-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </span>
  );
}
