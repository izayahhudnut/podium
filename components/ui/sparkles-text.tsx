"use client";

import React from "react";

import { cn } from "@/lib/utils";

type SparklesTextProps = {
  children: string;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
};

export function SparklesText({
  children,
  className,
  sparklesCount = 6,
  colors = { first: "#A07CFE", second: "#FE8FB5" },
}: SparklesTextProps) {
  const sparkles = Array.from({ length: sparklesCount });
  const positions = sparkles.map((_, index) => {
    const angle = (index * 137.5) % 360;
    const radiusX = 36 + (index % 3) * 12;
    const radiusY = 24 + (index % 4) * 10;
    const left = 50 + Math.cos((angle * Math.PI) / 180) * radiusX;
    const top = 50 + Math.sin((angle * Math.PI) / 180) * radiusY;
    return {
      left: `${Math.max(6, Math.min(94, left))}%`,
      top: `${Math.max(6, Math.min(94, top))}%`,
    };
  });
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0">
        {sparkles.map((_, index) => {
          const { left, top } = positions[index];
          const delay = `${index * 0.4}s`;
          const size = index % 2 === 0 ? 10 : 7;
          const fill = index % 2 === 0 ? colors.first : colors.second;
          return (
            <span
              key={index}
              className="absolute animate-[sparkle_2.8s_ease-in-out_infinite]"
              style={{
                left,
                top,
                animationDelay: delay,
              }}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-[0_0_8px_rgba(0,0,0,0.08)]"
              >
                <path
                  d="M12 2.5l2.6 5.26 5.8.84-4.2 4.1 1 5.78L12 15.7 6.8 18.5l1-5.78-4.2-4.1 5.8-.84L12 2.5z"
                  fill={fill}
                />
              </svg>
            </span>
          );
        })}
      </span>
      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0.2;
            transform: scale(0.7) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.15) rotate(10deg);
          }
          100% {
            opacity: 0.2;
            transform: scale(0.7) rotate(0deg);
          }
        }
      `}</style>
    </span>
  );
}
